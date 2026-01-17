import express from "express";
import multer from "multer";
import path from "path";
import AWS from "aws-sdk";
import db from "../config/db.js";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

const getInstructorCollege = async (userId) => {
  const res = await db.query(
    "SELECT organisation FROM instructors WHERE user_id=$1",
    [userId]
  );

  if (res.rowCount === 0) return null;
  return res.rows[0].organisation;
};

/* AWS CONFIG */
process.env.AWS_EC2_METADATA_DISABLED = "true";

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

/* UTILS */
const normalize = (name) =>
  name.trim().toLowerCase().replace(/\s+/g, "-");

/* ===============================
   CREATE COURSE (S3 + DB)
================================ */
router.post(
  "/courses",
  authMiddleware,
  roleMiddleware(["instructor"]),
  async (req, res) => {
    try {
      const { courseName } = req.body;

      if (!courseName?.trim()) {
        return res.status(400).json({ error: "Course name required" });
      }

      // 🔍 Get college from DB
      const college = await getInstructorCollege(req.user.userId);

      if (!college) {
        return res.status(400).json({ error: "Instructor college not found" });
      }

      const courseKey = courseName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

      const result = await db.query(
        `
        INSERT INTO courses (course_name, course_key, college_name, created_by)
        VALUES ($1,$2,$3,$4)
        RETURNING *
        `,
        [courseName, courseKey, college, req.user.userId]
      );

      // 🔍 CREATE S3 COURSE FOLDERS
      const basePath = `${college}/${courseKey}`;
      const folders = ["Videos", "PDFs", "Images"];

      for (const folder of folders) {
        await s3.putObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `${basePath}/${folder}/`,
        }).promise();
      }

      res.json(result.rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        return res
          .status(400)
          .json({ error: "Course already exists for this college" });
      }
      console.error(err);
      res.status(500).json({ error: "Course creation failed" });
    }
  }
);

router.get(
  "/courses",
  authMiddleware,
  roleMiddleware(["instructor"]),
  async (req, res) => {
    try {
      const orgRes = await db.query(
        "SELECT organisation FROM instructors WHERE user_id=$1",
        [req.user.userId]
      );

      if (!orgRes.rowCount) {
        return res.status(404).json({ error: "Instructor not found" });
      }

      const college = orgRes.rows[0].organisation;

      const result = await db.query(
        "SELECT * FROM courses WHERE college_name=$1 ORDER BY created_at DESC",
        [college]
      );

      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching courses:", err);
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  }
);

// GET MODULES BY COURSE
router.get(
  "/modules/:courseId",
  authMiddleware,
  roleMiddleware(["instructor"]),
  async (req, res) => {
    try {
      const { courseId } = req.params;

      const result = await db.query(
        "SELECT module_id, module_name FROM modules WHERE course_id=$1 ORDER BY module_id ASC",
        [courseId]
      );

      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching modules:", err);
      res.status(500).json({ error: "Failed to fetch modules" });
    }
  }
);

/* ===============================
   CREATE MODULE (DB ONLY)
================================ */
router.post(
  "/modules",
  authMiddleware,
  roleMiddleware(["instructor"]),
  async (req, res) => {
    try {
      const { courseId, moduleName } = req.body;

      if (!moduleName?.trim()) {
        return res.status(400).json({ error: "Module name required" });
      }

      const result = await db.query(
        `
        INSERT INTO modules (module_name, course_id)
        VALUES ($1,$2)
        RETURNING *
        `,
        [moduleName, courseId]
      );

      res.json(result.rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        return res.status(400).json({ error: "Module already exists" });
      }
      console.error("Error creating module:", err);
      res.status(500).json({ error: "Module creation failed" });
    }
  }
);

// ✅ LIST UPLOADED CONTENT FROM S3 (INSTRUCTOR)
router.get(
  "/content",
  authMiddleware,
  roleMiddleware(["instructor"]),
  async (req, res) => {
    try {
      // Get instructor's college
      const college = await getInstructorCollege(req.user.userId);
      
      if (!college) {
        return res.status(404).json({ error: "Instructor college not found" });
      }

      // Get all courses for this instructor's college
      const coursesRes = await db.query(
        `SELECT course_id, course_name, course_key FROM courses WHERE college_name = $1`,
        [college]
      );

      const allContent = [];

      // For each course, list files from S3
      for (const course of coursesRes.rows) {
        const folders = ["Videos", "PDFs", "Images"];
        
        for (const folder of folders) {
          const prefix = `${college}/${course.course_key}/${folder}/`;
          
          try {
            const s3Response = await s3.listObjectsV2({
              Bucket: process.env.AWS_BUCKET_NAME,
              Prefix: prefix,
            }).promise();

            if (s3Response.Contents) {
              s3Response.Contents.forEach(item => {
                // Skip folder markers
                if (!item.Key.endsWith('/')) {
                  // Extract module info from filename if it follows convention
                  const fileName = item.Key.split('/').pop();
                  const moduleMatch = fileName.match(/^module-(\d+)-/i);
                  const moduleNumber = moduleMatch ? moduleMatch[1] : 'all';
                  
                  allContent.push({
                    s3_key: item.Key,
                    file_name: fileName,
                    content_type: folder.toLowerCase().slice(0, -1),
                    course_name: course.course_name,
                    module_number: moduleNumber,
                    uploaded_at: item.LastModified,
                    size: item.Size
                  });
                }
              });
            }
          } catch (e) {
            console.error(`Error listing S3 files for ${prefix}:`, e);
          }
        }
      }

      // Sort by upload date, newest first
      allContent.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));

      res.json(allContent);
    } catch (err) {
      console.error("Error fetching content:", err);
      res.status(500).json({ error: "Failed to fetch content" });
    }
  }
);

// ✅ UPLOAD CONTENT TO S3 (with module-specific naming)
router.post(
  "/content/upload",
  authMiddleware,
  roleMiddleware(["instructor"]),
  upload.single("file"),
  async (req, res) => {
    try {
      const { moduleId, contentType } = req.body;
      const file = req.file;

      if (!file || !moduleId || !contentType) {
        return res.status(400).json({ error: "Missing fields" });
      }

      if (!["video", "pdf", "image"].includes(contentType)) {
        return res.status(400).json({ error: "Invalid content type" });
      }

      /* =========================
         GET MODULE + COURSE INFO
      ========================= */
      const moduleRes = await db.query(
        `
        SELECT 
          m.module_id,
          m.module_name,
          c.course_id,
          c.course_key,
          c.college_name,
          (SELECT COUNT(*) FROM modules WHERE course_id = c.course_id AND module_id <= m.module_id) as module_number
        FROM modules m
        JOIN courses c ON m.course_id = c.course_id
        WHERE m.module_id = $1
        `,
        [moduleId]
      );

      if (!moduleRes.rowCount) {
        return res.status(404).json({ error: "Module not found" });
      }

      const { course_key, college_name, module_number } = moduleRes.rows[0];

      /* =========================
         S3 PATH with Module Number
      ========================= */
      const folderMap = {
        video: "Videos",
        pdf: "PDFs",
        image: "Images",
      };

      const ext = path.extname(file.originalname);
      const cleanName = file.originalname
        .replace(ext, "")
        .toLowerCase()
        .replace(/\s+/g, "-");

      // Add module number prefix to filename
      const s3Key = `${college_name}/${course_key}/${folderMap[contentType]}/module-${module_number}-${cleanName}${ext}`;

      /* =========================
         UPLOAD TO S3
      ========================= */
      await s3
        .putObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: s3Key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
        .promise();

      res.json({ 
        message: "Content uploaded successfully",
        s3_key: s3Key,
        file_name: file.originalname,
        module_number: module_number
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

// ✅ DELETE CONTENT FROM S3
router.delete(
  "/content",
  authMiddleware,
  roleMiddleware(["instructor"]),
  async (req, res) => {
    try {
      // Get S3 key from query parameter
      const s3Key = req.query.s3Key;

      if (!s3Key) {
        return res.status(400).json({ error: "S3 key is required" });
      }

      // Delete from S3
      await s3
        .deleteObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: decodeURIComponent(s3Key),
        })
        .promise();

      res.json({ message: "Content deleted successfully" });
    } catch (err) {
      console.error("Delete error:", err);
      res.status(500).json({ error: "Delete failed" });
    }
  }
);

export default router;