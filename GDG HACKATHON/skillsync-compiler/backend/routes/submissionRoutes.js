const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  submitExam,
  getSubmissionReport,
  saveSnapshot
} = require('../controllers/submissionController');

const router = express.Router();

router.post('/submit', authMiddleware, submitExam);
router.get('/report/:submission_id', authMiddleware, getSubmissionReport);
router.post('/snapshot', authMiddleware, saveSnapshot);

module.exports = router;