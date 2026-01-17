const express = require("express");
const multer = require("multer");
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");
const {
  createExam,
  parseExcel,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam
} = require("../controllers/examController");

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Admin routes
router.post("/create", authMiddleware, adminOnly, createExam);
router.post("/parse-excel", authMiddleware, adminOnly, upload.single("file"), parseExcel);
router.put("/:id", authMiddleware, adminOnly, updateExam);
router.delete("/:id", authMiddleware, adminOnly, deleteExam);

// Public routes (authenticated)
router.get("/", authMiddleware, getAllExams);
router.get("/:id", authMiddleware, getExamById);

module.exports = router;