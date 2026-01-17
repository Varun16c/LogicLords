const pool = require('../db');
const plagiarismService = require('../services/plagiarismService');
const scoreEvaluationService = require('../services/scoreEvaluationService');

/* SUBMIT EXAM */
exports.submitExam = async (req, res) => {
  const { 
    exam_id, 
    code, 
    language, 
    start_time, 
    tab_switches,
    is_auto_submitted = false,
    auto_submit_reason = null
  } = req.body;
  
  const student_id = req.user.id;
  
  try {
    // Validate required fields
    if (!exam_id || !code || !language || !start_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const submit_time = new Date();
    const start = new Date(start_time);
    const time_taken_seconds = Math.floor((submit_time - start) / 1000);
    
    // Check if already submitted
    const existing = await pool.query(
      `SELECT id FROM submissions WHERE student_id = $1 AND exam_id = $2`,
      [student_id, exam_id]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already submitted this exam' });
    }
    
    // Create submission
    const result = await pool.query(
      `INSERT INTO submissions 
       (student_id, exam_id, code, language, start_time, submit_time, 
        time_taken_seconds, tab_switches, tab_switch_count, 
        is_auto_submitted, auto_submit_reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        student_id,
        exam_id,
        code,
        language,
        start_time,
        submit_time,
        time_taken_seconds,
        JSON.stringify(tab_switches || []),
        (tab_switches || []).length,
        is_auto_submitted,
        auto_submit_reason
      ]
    );
    
    const submission = result.rows[0];
    
    // Run plagiarism detection and score evaluation asynchronously
    (async () => {
      try {
        console.log('🔍 Starting background analysis...');
        
        // 1. Run plagiarism detection first
        await plagiarismService.detectPlagiarism(submission.id);
        console.log('✅ Plagiarism detection complete');
        
        // 2. Then run score evaluation (depends on plagiarism report)
        await scoreEvaluationService.calculateScore(submission.id);
        console.log('✅ Score evaluation complete');
      } catch (err) {
        console.error('❌ Background evaluation failed:', err);
      }
    })();
    
    res.status(201).json({ 
      message: 'Submission successful',
      submission_id: submission.id
    });
    
  } catch (error) {
    console.error('SUBMIT EXAM ERROR:', error);
    res.status(500).json({ error: 'Failed to submit exam', details: error.message });
  }
};

/* GET SUBMISSION REPORT */
exports.getSubmissionReport = async (req, res) => {
  const { submission_id } = req.params;
  const student_id = req.user.id;
  
  try {
    // Get submission with exam details
    const result = await pool.query(
      `SELECT 
        s.*,
        e.title as exam_title,
        e.question,
        e.solution,
        e.marks,
        u.name as student_name
       FROM submissions s
       JOIN exams e ON s.exam_id = e.id
       JOIN users u ON s.student_id = u.id
       WHERE s.id = $1 AND s.student_id = $2`,
      [submission_id, student_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    const submission = result.rows[0];
    
    // Get plagiarism report
    const reportResult = await pool.query(
      `SELECT * FROM plagiarism_reports WHERE submission_id = $1`,
      [submission_id]
    );
    
    const plagiarismReport = reportResult.rows[0] || null;
    
    res.json({
      submission,
      plagiarism_report: plagiarismReport
    });
    
  } catch (error) {
    console.error('GET REPORT ERROR:', error);
    res.status(500).json({ error: 'Failed to fetch report', details: error.message });
  }
};

/* SAVE CODE SNAPSHOT (Auto-save during exam) */
exports.saveSnapshot = async (req, res) => {
  const { exam_id, code, language } = req.body;
  const student_id = req.user.id;
  
  try {
    await pool.query(
      `INSERT INTO code_snapshots (student_id, exam_id, code, language)
       VALUES ($1, $2, $3, $4)`,
      [student_id, exam_id, code, language]
    );
    
    res.json({ message: 'Snapshot saved' });
  } catch (error) {
    console.error('SNAPSHOT ERROR:', error);
    res.status(500).json({ error: 'Failed to save snapshot' });
  }
};

// IMPORTANT: Export all functions
module.exports = {
  submitExam: exports.submitExam,
  getSubmissionReport: exports.getSubmissionReport,
  saveSnapshot: exports.saveSnapshot
};