import express from "express";
import bcrypt from "bcrypt";
import multer from "multer";
import xlsx from "xlsx";
import db from "../config/db.js";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
console.log("✅ students routes loaded");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ---------- helpers ----------
const toNullIfEmpty = (v) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
};

const parseBool = (v) => {
  if (v === undefined || v === null) return false;
  const s = String(v).trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "y";
};

const parseIntOrNull = (v) => {
  const s = toNullIfEmpty(v);
  if (s === null) return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
};

const parseNumOrNull = (v) => {
  const s = toNullIfEmpty(v);
  if (s === null) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

async function getOrgIdForInstructor(userId) {
  const r = await db.query(`SELECT org_id FROM user_organisation WHERE user_id = $1`, [userId]);
  return r.rows[0]?.org_id ?? null;
}

async function getOrgNameByOrgId(orgId) {
  const r = await db.query(`SELECT org_name FROM organisations WHERE org_id = $1`, [orgId]);
  return r.rows[0]?.org_name ?? null;
}

async function emailExists(email) {
  const r = await db.query(`SELECT id FROM users WHERE email=$1`, [email]);
  return r.rowCount > 0;
}

// All mandatory fields list (single + bulk)
const REQUIRED_FIELDS = [
  "name",
  "email",
  "password",
  "dob",
  "gender",
  "contact",
  "address",
  "roll_no",
  "department",
  "year_of_study",
  "admission_year",
  "graduate_year",
  "cgpa",
  "marks_10",
  "marks_12",
  "backlogs",
  "skills",
  "certifications",
  "projects",
  "resume_url",
  "job_roles",
  "job_locations",
  "placement_status"
];

const validateRequired = (obj, requiredKeys) => {
  for (const k of requiredKeys) {
    const v = obj?.[k];
    if (v === undefined || v === null || String(v).trim() === "") {
      return `Missing field: ${k}`;
    }
  }
  return null;
};

// ---------- GET list (org scoped) ----------
router.get("/", authMiddleware, roleMiddleware(["instructor"]), async (req, res) => {
  try {
    const instructorId = req.user.userId;
    const orgId = await getOrgIdForInstructor(instructorId);
    if (!orgId) return res.status(403).json({ error: "Organisation not mapped for instructor" });

    const search = (req.query.search || "").trim();
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "35", 10)));
    const offset = (page - 1) * limit;

    const params = [orgId];
    let whereSearch = "";
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      whereSearch = `AND LOWER(u.name) LIKE $${params.length}`;
    }

    const countQ = `
      SELECT COUNT(*)::int AS total
      FROM organisation_students os
      JOIN students s ON s.student_id = os.student_id
      JOIN users u ON u.id = s.user_id
      WHERE os.org_id = $1
      ${whereSearch}
    `;

    // ✅ IMPORTANT: DB column is s.isplaced (lowercase)
    // ✅ Return alias as "isPlaced" so frontend continues working
    const listQ = `
      SELECT
        s.student_id,
        s.dob, s.gender, s.contact, s.address, s.roll_no, s.college, s.department, s.year_of_study,
        s.admission_year, s.graduate_year, s.cgpa, s.marks_10, s.marks_12, s.backlogs,
        s.skills, s.certifications, s.projects,
        s.resume_url, s.job_roles, s.job_locations, s.placement_status,
        s.is_first_login,
        u.id AS user_id,
        u.name,
        u.email,
        u.created_at
      FROM organisation_students os
      JOIN students s ON s.student_id = os.student_id
      JOIN users u ON u.id = s.user_id
      WHERE os.org_id = $1
      ${whereSearch}
      ORDER BY u.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const totalRes = await db.query(countQ, params);
    const total = totalRes.rows[0]?.total ?? 0;

    const rowsRes = await db.query(listQ, [...params, limit, offset]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      students: rowsRes.rows,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});
// ---------- GET logged-in student profile ----------
// Add this fixed /me endpoint to your students.routes.js

router.get(
  "/me",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    try {
      const userId = req.user.userId; // Fixed from req.user.id

      const r = await db.query(
        `
        SELECT
          s.student_id,
          u.name,
          u.email,
          s.dob, s.gender, s.contact, s.address, s.roll_no,
          s.college, s.department, s.year_of_study,
          s.admission_year, s.graduate_year,
          s.cgpa, s.marks_10, s.marks_12, s.backlogs,
          s.skills, s.certifications, s.projects,
          s.resume_url, s.job_roles, s.job_locations, s.placement_status
        FROM students s
        JOIN users u ON u.id = s.user_id
        WHERE s.user_id = $1
        LIMIT 1
        `,
        [userId]
      );

      if (!r.rowCount) {
        return res.status(404).json({ error: "Student profile not found" });
      }

      res.json(r.rows[0]);
    } catch (e) {
      console.error("Student /me error:", e);
      res.status(500).json({ error: "Server error" });
    }
  }
);



// ---------- POST single create (org scoped) ----------
router.post("/", authMiddleware, roleMiddleware(["instructor"]), async (req, res) => {
  const client = await db.connect();
  try {
    const instructorId = req.user.userId;
    const orgId = await getOrgIdForInstructor(instructorId);
    if (!orgId) return res.status(403).json({ error: "Organisation not mapped for instructor" });

    const orgName = await getOrgNameByOrgId(orgId);
    if (!orgName) return res.status(403).json({ error: "Organisation name not found" });

    const missing = validateRequired(req.body, REQUIRED_FIELDS);
    if (missing) return res.status(400).json({ error: missing });

    const {
      name,
      email,
      password,
      dob,
      gender,
      contact,
      address,
      roll_no,
      department,
      year_of_study,
      admission_year,
      graduate_year,
      cgpa,
      marks_10,
      marks_12,
      backlogs,
      skills,
      certifications,
      projects,
      resume_url,
      job_roles,
      job_locations,
      placement_status,
    } = req.body;

    await client.query("BEGIN");

    if (await emailExists(email)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const u = await client.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1,$2,$3,'student')
       RETURNING id, created_at`,
      [name, email, hashed]
    );

    const userId = u.rows[0].id;

    // ✅ IMPORTANT: DB column is "isplaced" (lowercase)
    const s = await client.query(
      `INSERT INTO students (
  user_id, dob, gender, contact, address, roll_no, college,
  department, year_of_study,
  admission_year, graduate_year,
  cgpa, marks_10, marks_12, backlogs,
  skills, certifications, projects,
  resume_url, job_roles, job_locations, placement_status
)
VALUES (
  $1,$2,$3,$4,$5,$6,$7,
  $8,$9,
  $10,$11,
  $12,$13,$14,$15,
  $16,$17,$18,
  $19,$20,$21,$22
)
`,
      [
        userId,
        toNullIfEmpty(dob),
        toNullIfEmpty(gender),
        toNullIfEmpty(contact),
        toNullIfEmpty(address),
        toNullIfEmpty(roll_no),
        orgName,
        toNullIfEmpty(department),
        toNullIfEmpty(year_of_study),
        parseIntOrNull(admission_year),
        parseIntOrNull(graduate_year),
        parseNumOrNull(cgpa),
        parseNumOrNull(marks_10),
        parseNumOrNull(marks_12),
        parseIntOrNull(backlogs),
        toNullIfEmpty(skills),
        toNullIfEmpty(certifications),
        toNullIfEmpty(projects),
        toNullIfEmpty(resume_url),
        toNullIfEmpty(job_roles),
        toNullIfEmpty(job_locations),
        toNullIfEmpty(placement_status),
      ]
    );

    const studentId = s.rows[0].student_id;

    await client.query(
      `INSERT INTO user_organisation (user_id, org_id)
       VALUES ($1,$2)
       ON CONFLICT (user_id) DO UPDATE SET org_id = EXCLUDED.org_id`,
      [userId, orgId]
    );

    await client.query(
      `INSERT INTO organisation_students (org_id, student_id)
       VALUES ($1,$2)
       ON CONFLICT DO NOTHING`,
      [orgId, studentId]
    );

    await client.query("COMMIT");
    res.status(201).json({ success: true, student_id: studentId });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

// ---------- PUT update (org scoped) ----------
router.put("/:student_id", authMiddleware, roleMiddleware(["instructor"]), async (req, res) => {
  const client = await db.connect();
  try {
    const instructorId = req.user.userId;
    const orgId = await getOrgIdForInstructor(instructorId);
    if (!orgId) return res.status(403).json({ error: "Organisation not mapped for instructor" });

    const orgName = await getOrgNameByOrgId(orgId);
    if (!orgName) return res.status(403).json({ error: "Organisation name not found" });

    const { student_id } = req.params;

    const requiredUpdate = REQUIRED_FIELDS.filter((k) => k !== "password");
    const missing = validateRequired(req.body, requiredUpdate);
    if (missing) return res.status(400).json({ error: missing });

    await client.query("BEGIN");

    const own = await client.query(
      `
      SELECT s.user_id
      FROM organisation_students os
      JOIN students s ON s.student_id = os.student_id
      WHERE os.org_id = $1 AND s.student_id = $2
      LIMIT 1
      `,
      [orgId, student_id]
    );

    if (!own.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Student not found in your organisation" });
    }

    const userId = own.rows[0].user_id;

    const {
      name,
      email,
      dob,
      gender,
      contact,
      address,
      roll_no,
      department,
      year_of_study,
      admission_year,
      graduate_year,
      cgpa,
      marks_10,
      marks_12,
      backlogs,
      skills,
      certifications,
      projects,
      resume_url,
      job_roles,
      job_locations,
      placement_status,
    } = req.body;

    await client.query(`UPDATE users SET name=$1, email=$2 WHERE id=$3`, [name, email, userId]);

    // ✅ IMPORTANT: DB column is "isplaced" (lowercase)
    await client.query(
      `UPDATE students
       SET dob=$1, gender=$2, contact=$3, address=$4,
           roll_no=$5, college=$6, department=$7, year_of_study=$8,
           admission_year=$9, graduate_year=$10,
           cgpa=$11, marks_10=$12, marks_12=$13, backlogs=$14,
           skills=$15, certifications=$16, projects=$17,
           resume_url=$18, job_roles=$19, job_locations=$20,
           placement_status=$21
       WHERE student_id=$22`,
      [
        toNullIfEmpty(dob),
        toNullIfEmpty(gender),
        toNullIfEmpty(contact),
        toNullIfEmpty(address),
        toNullIfEmpty(roll_no),
        orgName,
        toNullIfEmpty(department),
        toNullIfEmpty(year_of_study),
        parseIntOrNull(admission_year),
        parseIntOrNull(graduate_year),
        parseNumOrNull(cgpa),
        parseNumOrNull(marks_10),
        parseNumOrNull(marks_12),
        parseIntOrNull(backlogs),
        toNullIfEmpty(skills),
        toNullIfEmpty(certifications),
        toNullIfEmpty(projects),
        toNullIfEmpty(resume_url),
        toNullIfEmpty(job_roles),
        toNullIfEmpty(job_locations),
        toNullIfEmpty(placement_status),
        student_id,
      ]
    );

    await client.query("COMMIT");
    res.json({ success: true, message: "Student updated" });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

// ---------- POST bulk upload (org scoped) ----------
router.post(
  "/bulk",
  authMiddleware,
  roleMiddleware(["instructor"]),
  upload.single("file"),
  async (req, res) => {
    const client = await db.connect();
    try {
      const instructorId = req.user.userId;
      const orgId = await getOrgIdForInstructor(instructorId);
      if (!orgId) return res.status(403).json({ error: "Organisation not mapped for instructor" });

      const orgName = await getOrgNameByOrgId(orgId);
      if (!orgName) return res.status(403).json({ error: "Organisation name not found" });

      if (!req.file) return res.status(400).json({ error: "File is required" });

      const fileName = req.file.originalname || "uploaded_file";
      const ext = fileName.split(".").pop().toLowerCase();

      let rows = [];

      if (ext === "csv") {
        const text = req.file.buffer.toString("utf8");
        const wb = xlsx.read(text, { type: "string" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        rows = xlsx.utils.sheet_to_json(ws, { defval: "" });
      } else if (ext === "xlsx" || ext === "xls") {
        const wb = xlsx.read(req.file.buffer, { type: "buffer" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        rows = xlsx.utils.sheet_to_json(ws, { defval: "" });
      } else {
        return res.status(400).json({ error: "Unsupported file type. Use CSV, XLSX, or XLS." });
      }

      let successCount = 0;
      const errors = [];
      const seenEmails = new Set();

      await client.query("BEGIN");

      for (let i = 0; i < rows.length; i++) {
        const excelRowNumber = i + 2;
        const r = rows[i] || {};

        const missing = validateRequired(r, REQUIRED_FIELDS);
        if (missing) {
          errors.push({ row: excelRowNumber, field: "row", message: missing });
          continue;
        }

        const name = toNullIfEmpty(r.name);
        const email = toNullIfEmpty(r.email);
        const password = toNullIfEmpty(r.password);

        const emailKey = email.toLowerCase();
        if (seenEmails.has(emailKey)) {
          errors.push({ row: excelRowNumber, field: "email", message: "Duplicate email in file" });
          continue;
        }
        seenEmails.add(emailKey);

        if (await emailExists(email)) {
          errors.push({ row: excelRowNumber, field: "email", message: "Email already registered" });
          continue;
        }

        try {
          const hashed = await bcrypt.hash(password, 10);

          const u = await client.query(
            `INSERT INTO users (name, email, password, role)
             VALUES ($1,$2,$3,'student')
             RETURNING id`,
            [name, email, hashed]
          );
          const userId = u.rows[0].id;

          // ✅ IMPORTANT: DB column is "isplaced" (lowercase)
          const s = await client.query(
            `INSERT INTO students (
              user_id, dob, gender, contact, address, roll_no, college, department, year_of_study,
              admission_year, graduate_year,
              cgpa, marks_10, marks_12, backlogs,
              skills, certifications, projects,
              resume_url, job_roles, job_locations, placement_status
            )
            VALUES (
              $1,$2,$3,$4,$5,$6,$7,$8,$9,
              $10,$11,
              $12,$13,$14,$15,
              $16,$17,$18,
              $19,$20,$21,$22
            )
            RETURNING student_id`,
            [
              userId,
              toNullIfEmpty(r.dob),
              toNullIfEmpty(r.gender),
              toNullIfEmpty(r.contact),
              toNullIfEmpty(r.address),
              toNullIfEmpty(r.roll_no),
              orgName,
              toNullIfEmpty(r.department),
              toNullIfEmpty(r.year_of_study),
              parseIntOrNull(r.admission_year),
              parseIntOrNull(r.graduate_year),
              parseNumOrNull(r.cgpa),
              parseNumOrNull(r.marks_10),
              parseNumOrNull(r.marks_12),
              parseIntOrNull(r.backlogs),
              toNullIfEmpty(r.skills),
              toNullIfEmpty(r.certifications),
              toNullIfEmpty(r.projects),
              toNullIfEmpty(r.resume_url),
              toNullIfEmpty(r.job_roles),
              toNullIfEmpty(r.job_locations),
              toNullIfEmpty(r.placement_status),
            ]
          );

          const studentId = s.rows[0].student_id;

          await client.query(
            `INSERT INTO user_organisation (user_id, org_id)
             VALUES ($1,$2)
             ON CONFLICT (user_id) DO UPDATE SET org_id = EXCLUDED.org_id`,
            [userId, orgId]
          );

          await client.query(
            `INSERT INTO organisation_students (org_id, student_id)
             VALUES ($1,$2)
             ON CONFLICT DO NOTHING`,
            [orgId, studentId]
          );

          successCount++;
        } catch (e) {
          errors.push({ row: excelRowNumber, field: "row", message: "Failed to insert row" });
        }
      }

      await client.query("COMMIT");

      res.json({
        fileName,
        successCount,
        errorCount: errors.length,
        errors,
      });
    } catch (e) {
      await client.query("ROLLBACK");
      console.error(e);
      res.status(500).json({ error: "Server error" });
    } finally {
      client.release();
    }
  }
);// ✅ DELETE student (org scoped)
// ✅ DELETE student (org scoped) - for Delete button
router.delete(
  "/:student_id",
  authMiddleware,
  roleMiddleware(["instructor"]),
  async (req, res) => {
    const client = await db.connect();
    try {
      const instructorId = req.user.userId;
      const orgId = await getOrgIdForInstructor(instructorId);
      if (!orgId) {
        return res.status(403).json({ error: "Organisation not mapped for instructor" });
      }

      const { student_id } = req.params;

      await client.query("BEGIN");

      // ✅ Make sure student belongs to this instructor org
      const own = await client.query(
        `
        SELECT s.user_id
        FROM organisation_students os
        JOIN students s ON s.student_id = os.student_id
        WHERE os.org_id = $1 AND s.student_id = $2
        LIMIT 1
        `,
        [orgId, student_id]
      );

      if (!own.rowCount) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Student not found in your organisation" });
      }

      const userId = own.rows[0].user_id;

      // ✅ Remove mapping first (safe)
      await client.query(
        `DELETE FROM organisation_students WHERE org_id = $1 AND student_id = $2`,
        [orgId, student_id]
      );

      // ✅ Delete student row (also cascades from users, but we handle cleanly)
      await client.query(`DELETE FROM students WHERE student_id = $1`, [student_id]);

      // ✅ Delete the user record (this will also delete from students due to FK cascade if still present)
      await client.query(`DELETE FROM users WHERE id = $1`, [userId]);

      await client.query("COMMIT");
      return res.json({ success: true, message: "Student deleted" });
    } catch (e) {
      await client.query("ROLLBACK");
      console.error(e);
      return res.status(500).json({ error: "Server error" });
    } finally {
      client.release();
    }
  }
);



export default router;
