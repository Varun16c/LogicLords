import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

/* ================= ADMIN DASHBOARD ================= */
router.get(
  "/admin",
  authMiddleware,
  roleMiddleware(["admin"]),
  (req, res) => {
    res.json({
      message: "Welcome Admin Dashboard",
      user: req.user, // { userId, role }
    });
  }
);

/* ================= INSTRUCTOR DASHBOARD ================= */
router.get(
  "/instructor",
  authMiddleware,
  roleMiddleware(["instructor"]),
  (req, res) => {
    res.json({
      message: "Welcome Instructor Dashboard",
      user: req.user,
    });
  }
);

/* ================= RECRUITER DASHBOARD ================= */
router.get(
  "/recruiter",
  authMiddleware,
  roleMiddleware(["recruiter"]),
  (req, res) => {
    res.json({
      message: "Welcome Recruiter Dashboard",
      user: req.user,
    });
  }
);

/* ================= STUDENT DASHBOARD ================= */
router.get(
  "/student",
  authMiddleware,
  roleMiddleware(["student"]),
  (req, res) => {
    res.json({
      message: "Welcome Student Dashboard",
      user: req.user,
    });
  }
);

export default router;
