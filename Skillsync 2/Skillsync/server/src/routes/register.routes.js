import express from "express";
import bcrypt from "bcrypt";
import db from "../config/db.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();
const isValidEmail = (email) =>
  /^[a-zA-Z0-9._%+-]+@(gmail\.com|.+\.edu\.in)$/.test(email);


const isValidPassword = (password) =>
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(password);

const isValidContact = (number) =>
  /^\d{10}$/.test(number);

/* =====================================================
   HELPER: CHECK IF EMAIL EXISTS
===================================================== */
const isEmailExists = async (email) => {
  const result = await db.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );
  return result.rowCount > 0;
};

/* =====================================================
   INSTRUCTOR REGISTRATION
===================================================== */
router.post(
  "/instructor",
  upload.single("profile_photo"),
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        contactNumber,
        organisation,
        designation,
        department,
        expertise,
        experience
      } = req.body;
      if (!isValidEmail(email)) {
        return res.status(400).json({
          error: "Email must be a valid Gmail or college (.edu.in) email"
        });
      }


      if (!isValidPassword(password)) {
        return res.status(400).json({
          error:
            "Password must be at least 6 characters and include 1 uppercase letter, 1 number, and 1 special character"
        });
      }

      if (!isValidContact(contactNumber)) {
        return res.status(400).json({
          error: "Contact number must be exactly 10 digits"
        });
      }

      if (!name || !email || !password) {
        return res.status(400).json({ error: "Required fields missing" });
      }

      if (await isEmailExists(email)) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const userResult = await db.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, 'instructor')
         RETURNING id`,
        [name, email, hashedPassword]
      );

      const userId = userResult.rows[0].id;
      await db.query(
        `INSERT INTO instructors (
    user_id,
    name,
    designation,
    department,
    expertise,
    experience,
    organisation,
    contact_number,
    email,
    profile_photo
  )
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          userId,
          name,
          designation,
          department,
          expertise,
          experience,
          organisation,
          contactNumber,
          email,
          req.file ? req.file.buffer : null
        ]
      );
      // 1) Ensure organisation exists
      const orgResult = await db.query(
        `INSERT INTO organisations (org_name)
   VALUES ($1)
   ON CONFLICT (org_name) DO UPDATE SET org_name = EXCLUDED.org_name
   RETURNING org_id`,
        [organisation]
      );

      const orgId = orgResult.rows[0].org_id;

      // 2) Map instructor user -> org
      await db.query(
        `INSERT INTO user_organisation (user_id, org_id)
   VALUES ($1, $2)
   ON CONFLICT (user_id) DO UPDATE SET org_id = EXCLUDED.org_id`,
        [userId, orgId]
      );


      res.status(201).json({
        success: true,
        message: "Instructor registered successfully"
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/* =====================================================
   RECRUITER REGISTRATION
===================================================== */
router.post(
  "/recruiter",
  upload.single("profile_photo"), // 👈 REQUIRED
  async (req, res) => {
    const client = await db.connect();

    try {
      const {
        recruiter_name,
        email,
        password,
        contact_number,
        designation,
        company_name,
        industry_type,
        website,
        job_title,
        job_description,
        required_skills,
        eligibility,
        salary_package,
        job_location,
        min_cgpa,
        job_type
      } = req.body;

      if (!recruiter_name || !email || !password) {
        return res.status(400).json({ error: "Required fields missing" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      if (!isValidEmail(email)) {
        return res.status(400).json({
          error: "Email must be a valid Gmail or college (.edu.in) email"
        });
      }


      if (!isValidPassword(password)) {
        return res.status(400).json({
          error:
            "Password must be at least 6 characters and include 1 uppercase letter, 1 number, and 1 special character"
        });
      }

      if (!isValidContact(contact_number)) {
        return res.status(400).json({
          error: "Contact number must be exactly 10 digits"
        });
      }

      await client.query("BEGIN");

      const userResult = await client.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1,$2,$3,'recruiter')
         RETURNING id`,
        [recruiter_name, email, hashedPassword]
      );

      const userId = userResult.rows[0].id;

      await client.query(
        `INSERT INTO recruiters (
          user_id,
          email,
          recruiter_name,
          designation,
          company_name,
          industry_type,
          website,
          contact_number,
          job_title,
          job_description,
          required_skills,
          eligibility,
          salary_package,
          job_location,
          min_cgpa,
          job_type,
          profile_photo
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
        [
          userId,
          email,
          recruiter_name,
          designation,
          company_name,
          industry_type,
          website,
          contact_number,
          job_title,
          job_description,
          required_skills,
          eligibility,
          salary_package,
          job_location,
          min_cgpa,
          job_type,
          req.file ? req.file.buffer : null
        ]
      );

      await client.query("COMMIT");

      res.status(201).json({ message: "Recruiter registered successfully" });

    } catch (err) {
      await client.query("ROLLBACK");
      console.error(err);
      res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  }
);

export default router;