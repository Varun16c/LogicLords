import express from "express";
import db from "../config/db.js";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const router = express.Router();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Generate presigned URL
const generatePresignedUrl = async (s3Key, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME, // ✅ FIXED: Changed from AWS_S3_BUCKET to AWS_BUCKET_NAME
    Key: s3Key,
  });
  return await getSignedUrl(s3Client, command, { expiresIn });
};

// List files from S3 for a specific course and content type
const listS3Files = async (collegeName, courseKey, contentType) => {
  const prefix = `${collegeName}/${courseKey}/${contentType}/`;
  
  const command = new ListObjectsV2Command({
    Bucket: process.env.AWS_BUCKET_NAME, // ✅ FIXED: Changed from AWS_S3_BUCKET to AWS_BUCKET_NAME
    Prefix: prefix,
  });

  try {
    const response = await s3Client.send(command);
    return (response.Contents || [])
      .filter(item => !item.Key.endsWith('/')) // Filter out folder markers
      .map(item => ({
        s3_key: item.Key,
        file_name: item.Key.split('/').pop(),
        size: item.Size,
        last_modified: item.LastModified
      }));
  } catch (e) {
    console.error(`Error listing S3 files for ${prefix}:`, e);
    return [];
  }
};

// Get available courses for student (based on their college)
router.get(
  "/available",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    try {
      const userId = req.user.userId;

      // Get student's college
      const studentRes = await db.query(
        `SELECT college FROM students WHERE user_id = $1`,
        [userId]
      );

      if (!studentRes.rowCount) {
        return res.status(404).json({ error: "Student profile not found" });
      }

      const college = studentRes.rows[0].college;

      // Get courses for this college
      const coursesRes = await db.query(
        `
        SELECT 
          c.course_id,
          c.course_name,
          c.course_key,
          c.college_name,
          c.created_at,
          u.name as instructor_name,
          COUNT(DISTINCT m.module_id) as module_count,
          EXISTS(
            SELECT 1 FROM course_enrollments ce
            JOIN students s ON s.student_id = ce.student_id
            WHERE s.user_id = $1 AND ce.course_id = c.course_id
          ) as is_enrolled
        FROM courses c
        LEFT JOIN users u ON u.id = c.created_by
        LEFT JOIN modules m ON m.course_id = c.course_id
        WHERE c.college_name = $2
        GROUP BY c.course_id, c.course_name, c.course_key, c.college_name, c.created_at, u.name
        ORDER BY c.created_at DESC
        `,
        [userId, college]
      );

      res.json(coursesRes.rows);
    } catch (e) {
      console.error("Error fetching available courses:", e);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Enroll in a course
router.post(
  "/enroll/:course_id",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    const client = await db.connect();
    try {
      const userId = req.user.userId;
      const { course_id } = req.params;

      await client.query("BEGIN");

      // Get student_id
      const studentRes = await client.query(
        `SELECT student_id, college FROM students WHERE user_id = $1`,
        [userId]
      );

      if (!studentRes.rowCount) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Student profile not found" });
      }

      const { student_id, college } = studentRes.rows[0];

      // Verify course belongs to student's college
      const courseRes = await client.query(
        `SELECT college_name FROM courses WHERE course_id = $1`,
        [course_id]
      );

      if (!courseRes.rowCount) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Course not found" });
      }

      if (courseRes.rows[0].college_name !== college) {
        await client.query("ROLLBACK");
        return res.status(403).json({ error: "This course is not available for your college" });
      }

      // Check if already enrolled
      const existingEnrollment = await client.query(
        `SELECT enrollment_id FROM course_enrollments WHERE student_id = $1 AND course_id = $2`,
        [student_id, course_id]
      );

      if (existingEnrollment.rowCount > 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Already enrolled in this course" });
      }

      // Create enrollment
      const enrollmentRes = await client.query(
        `INSERT INTO course_enrollments (student_id, course_id)
         VALUES ($1, $2)
         RETURNING enrollment_id, enrolled_at`,
        [student_id, course_id]
      );

      await client.query("COMMIT");
      res.json({
        success: true,
        message: "Successfully enrolled in course",
        enrollment: enrollmentRes.rows[0]
      });
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("Error enrolling in course:", e);
      res.status(500).json({ error: "Server error" });
    } finally {
      client.release();
    }
  }
);

// Get enrolled courses for student
router.get(
  "/enrolled",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    try {
      const userId = req.user.userId;

      const coursesRes = await db.query(
        `
        SELECT 
          c.course_id,
          c.course_name,
          c.course_key,
          c.college_name,
          ce.enrollment_id,
          ce.enrolled_at,
          ce.progress,
          ce.last_accessed,
          u.name as instructor_name,
          COUNT(DISTINCT m.module_id) as module_count,
          COUNT(DISTINCT mp.progress_id) FILTER (WHERE mp.is_completed = true) as completed_modules
        FROM course_enrollments ce
        JOIN students s ON s.student_id = ce.student_id
        JOIN courses c ON c.course_id = ce.course_id
        LEFT JOIN users u ON u.id = c.created_by
        LEFT JOIN modules m ON m.course_id = c.course_id
        LEFT JOIN module_progress mp ON mp.enrollment_id = ce.enrollment_id AND mp.module_id = m.module_id
        WHERE s.user_id = $1
        GROUP BY c.course_id, c.course_name, c.course_key, c.college_name, 
                 ce.enrollment_id, ce.enrolled_at, ce.progress, ce.last_accessed, u.name
        ORDER BY ce.last_accessed DESC NULLS LAST, ce.enrolled_at DESC
        `,
        [userId]
      );

      res.json(coursesRes.rows);
    } catch (e) {
      console.error("Error fetching enrolled courses:", e);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get course content with modules (for enrolled students)
router.get(
  "/:course_id/content",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const { course_id } = req.params;

      // Verify enrollment
      const enrollmentRes = await db.query(
        `
        SELECT ce.enrollment_id 
        FROM course_enrollments ce
        JOIN students s ON s.student_id = ce.student_id
        WHERE s.user_id = $1 AND ce.course_id = $2
        `,
        [userId, course_id]
      );

      if (!enrollmentRes.rowCount) {
        return res.status(403).json({ error: "Not enrolled in this course" });
      }

      const enrollment_id = enrollmentRes.rows[0].enrollment_id;

      // Get course details
      const courseRes = await db.query(
        `SELECT course_id, course_name, course_key, college_name FROM courses WHERE course_id = $1`,
        [course_id]
      );

      if (!courseRes.rowCount) {
        return res.status(404).json({ error: "Course not found" });
      }

      const course = courseRes.rows[0];

      // Get modules from DB (order by module number)
      const modulesRes = await db.query(
        `
        SELECT 
          m.module_id,
          m.module_name,
          m.created_at,
          COALESCE(mp.is_completed, false) as is_completed,
          mp.completed_at
        FROM modules m
        LEFT JOIN module_progress mp ON mp.module_id = m.module_id AND mp.enrollment_id = $1
        WHERE m.course_id = $2
        ORDER BY m.module_id ASC
        `,
        [enrollment_id, course_id]
      );

      // For each module, fetch content from S3
      const modules = await Promise.all(
        modulesRes.rows.map(async (module, index) => {
          const moduleNumber = index + 1;
          
          // ✅ Fetch all content from S3 (Videos, PDFs, Images)
          const videos = await listS3Files(course.college_name, course.course_key, 'Videos');
          const pdfs = await listS3Files(course.college_name, course.course_key, 'PDFs');
          const images = await listS3Files(course.college_name, course.course_key, 'Images');

          // ✅ Filter content by module number based on filename convention
          const filterByModule = (items) => {
            return items.filter(item => {
              const fileName = item.file_name.toLowerCase();
              // Check if file starts with "module-X-" where X is the module number
              const moduleMatch = fileName.match(/^module-(\d+)-/);
              if (moduleMatch) {
                return parseInt(moduleMatch[1]) === moduleNumber;
              }
              // If no module prefix, show in all modules (backwards compatibility)
              return true;
            });
          };

          const filteredVideos = filterByModule(videos);
          const filteredPdfs = filterByModule(pdfs);
          const filteredImages = filterByModule(images);

          // Generate presigned URLs for filtered content
          const allContent = [
            ...filteredVideos.map(v => ({ ...v, content_type: 'video' })),
            ...filteredPdfs.map(p => ({ ...p, content_type: 'pdf' })),
            ...filteredImages.map(i => ({ ...i, content_type: 'image' }))
          ];

          // Generate presigned URLs
          const contentsWithUrls = await Promise.all(
            allContent.map(async (content) => {
              const url = await generatePresignedUrl(content.s3_key);
              return {
                s3_key: content.s3_key,
                file_name: content.file_name,
                content_type: content.content_type,
                url: url,
                size: content.size,
                last_modified: content.last_modified
              };
            })
          );

          return {
            ...module,
            module_number: moduleNumber,
            contents: contentsWithUrls
          };
        })
      );

      // Update last accessed
      await db.query(
        `UPDATE course_enrollments SET last_accessed = CURRENT_TIMESTAMP WHERE enrollment_id = $1`,
        [enrollment_id]
      );

      res.json({
        course,
        modules
      });
    } catch (e) {
      console.error("Error fetching course content:", e);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Mark module as complete
router.post(
  "/:course_id/modules/:module_id/complete",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    const client = await db.connect();
    try {
      const userId = req.user.userId;
      const { course_id, module_id } = req.params;

      await client.query("BEGIN");

      // Get enrollment
      const enrollmentRes = await client.query(
        `
        SELECT ce.enrollment_id 
        FROM course_enrollments ce
        JOIN students s ON s.student_id = ce.student_id
        WHERE s.user_id = $1 AND ce.course_id = $2
        `,
        [userId, course_id]
      );

      if (!enrollmentRes.rowCount) {
        await client.query("ROLLBACK");
        return res.status(403).json({ error: "Not enrolled in this course" });
      }

      const enrollment_id = enrollmentRes.rows[0].enrollment_id;

      // Mark module as complete
      await client.query(
        `
        INSERT INTO module_progress (enrollment_id, module_id, is_completed, completed_at)
        VALUES ($1, $2, true, CURRENT_TIMESTAMP)
        ON CONFLICT (enrollment_id, module_id) 
        DO UPDATE SET is_completed = true, completed_at = CURRENT_TIMESTAMP
        `,
        [enrollment_id, module_id]
      );

      // Update overall course progress
      const progressRes = await client.query(
        `
        SELECT 
          COUNT(*) as total_modules,
          COUNT(*) FILTER (WHERE mp.is_completed = true) as completed_modules
        FROM modules m
        LEFT JOIN module_progress mp ON mp.module_id = m.module_id AND mp.enrollment_id = $1
        WHERE m.course_id = $2
        `,
        [enrollment_id, course_id]
      );

      const { total_modules, completed_modules } = progressRes.rows[0];
      const progress = total_modules > 0 ? Math.round((completed_modules / total_modules) * 100) : 0;

      await client.query(
        `UPDATE course_enrollments SET progress = $1 WHERE enrollment_id = $2`,
        [progress, enrollment_id]
      );

      await client.query("COMMIT");
      res.json({ success: true, progress });
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("Error marking module complete:", e);
      res.status(500).json({ error: "Server error" });
    } finally {
      client.release();
    }
  }
);

// Mark module as incomplete (toggle)
router.post(
  "/:course_id/modules/:module_id/incomplete",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    const client = await db.connect();
    try {
      const userId = req.user.userId;
      const { course_id, module_id } = req.params;

      await client.query("BEGIN");

      // Get enrollment
      const enrollmentRes = await client.query(
        `
        SELECT ce.enrollment_id 
        FROM course_enrollments ce
        JOIN students s ON s.student_id = ce.student_id
        WHERE s.user_id = $1 AND ce.course_id = $2
        `,
        [userId, course_id]
      );

      if (!enrollmentRes.rowCount) {
        await client.query("ROLLBACK");
        return res.status(403).json({ error: "Not enrolled in this course" });
      }

      const enrollment_id = enrollmentRes.rows[0].enrollment_id;

      // Mark module as incomplete
      await client.query(
        `
        INSERT INTO module_progress (enrollment_id, module_id, is_completed, completed_at)
        VALUES ($1, $2, false, NULL)
        ON CONFLICT (enrollment_id, module_id) 
        DO UPDATE SET is_completed = false, completed_at = NULL
        `,
        [enrollment_id, module_id]
      );

      // Update overall course progress
      const progressRes = await client.query(
        `
        SELECT 
          COUNT(*) as total_modules,
          COUNT(*) FILTER (WHERE mp.is_completed = true) as completed_modules
        FROM modules m
        LEFT JOIN module_progress mp ON mp.module_id = m.module_id AND mp.enrollment_id = $1
        WHERE m.course_id = $2
        `,
        [enrollment_id, course_id]
      );

      const { total_modules, completed_modules } = progressRes.rows[0];
      const progress = total_modules > 0 ? Math.round((completed_modules / total_modules) * 100) : 0;

      await client.query(
        `UPDATE course_enrollments SET progress = $1 WHERE enrollment_id = $2`,
        [progress, enrollment_id]
      );

      await client.query("COMMIT");
      res.json({ success: true, progress });
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("Error marking module incomplete:", e);
      res.status(500).json({ error: "Server error" });
    } finally {
      client.release();
    }
  }
);

export default router;
