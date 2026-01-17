import express from "express";
import AWS from "aws-sdk";
import db from "../config/db.js";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

/* ===============================
   AWS S3 CONFIG
================================ */
process.env.AWS_EC2_METADATA_DISABLED = "true";

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

/* ======================================================
   GET ALL PENDING INSTRUCTOR REQUESTS
====================================================== */
router.get(
  "/pending",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const result = await db.query(`
        SELECT
          i.instructor_id,
          u.id AS user_id,
          u.name,
          u.email,
          i.organisation,
          i.approval_status,
          u.created_at
        FROM instructors i
        JOIN users u ON u.id = i.user_id
        WHERE i.approval_status = 'PENDING'
        ORDER BY u.created_at DESC
      `);

      res.json(result.rows);
    } catch (err) {
      console.error("FETCH PENDING INSTRUCTORS ERROR:", err);
      res.status(500).json({ error: "Failed to fetch pending instructors" });
    }
  }
);

/* ======================================================
   GET ALL INSTRUCTORS (APPROVED + PENDING + REJECTED)
====================================================== */
router.get(
  "/instructors",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const result = await db.query(`
        SELECT
          i.instructor_id,
          u.name,
          u.email,
          i.organisation,
          i.approval_status,
          i.approved_at,
          u.created_at
        FROM instructors i
        JOIN users u ON u.id = i.user_id
        ORDER BY u.created_at DESC
      `);

      res.json(result.rows);
    } catch (err) {
      console.error("FETCH INSTRUCTORS ERROR:", err);
      res.status(500).json({ error: "Failed to fetch instructors" });
    }
  }
);

/* ======================================================
   APPROVE INSTRUCTOR + CREATE S3 COLLEGE FOLDER
====================================================== */
router.put(
  "/instructors/:id/approve",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const instructorId = req.params.id;

      // Get instructor organisation (college)
      const result = await db.query(
        `
        SELECT organisation
        FROM instructors
        WHERE instructor_id = $1
          AND approval_status = 'PENDING'
        `,
        [instructorId]
      );

      if (!result.rowCount) {
        return res.status(404).json({
          error: "Instructor not found or already approved",
        });
      }

      const collegeName = result.rows[0].organisation.trim();

      // Approve instructor
      await db.query(
        `
        UPDATE instructors
        SET approval_status = 'APPROVED',
            approved_at = NOW()
        WHERE instructor_id = $1
        `,
        [instructorId]
      );

      // Create ONLY college folder in S3
      await s3
        .putObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `${collegeName}/`,
        })
        .promise();

      res.json({
        message: "Instructor approved successfully",
        collegeFolder: `${collegeName}/`,
      });
    } catch (err) {
      console.error("APPROVE INSTRUCTOR ERROR:", err);
      res.status(500).json({ error: "Approval failed" });
    }
  }
);

/* ======================================================
   REJECT INSTRUCTOR
====================================================== */
router.put(
  "/instructors/:id/reject",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const instructorId = req.params.id;

      await db.query(
        `
        UPDATE instructors
        SET approval_status = 'REJECTED'
        WHERE instructor_id = $1
        `,
        [instructorId]
      );

      res.json({ message: "Instructor rejected successfully" });
    } catch (err) {
      console.error("REJECT INSTRUCTOR ERROR:", err);
      res.status(500).json({ error: "Rejection failed" });
    }
  }
);

export default router;
