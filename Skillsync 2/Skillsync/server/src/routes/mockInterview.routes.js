// server/routes/mockInterview.routes.js
import express from "express";
import db from "../config/db.js";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import { generateQuestionsAI, evaluateAnswersAI } from "../services/geminiService.js";

const router = express.Router();

console.log("✅ Mock Interview routes loaded");

// ===================================================
// 1️⃣ Generate Mock Interview Questions
// ===================================================
router.post(
  "/generate-questions",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    try {
      console.log("🎯 Generating questions for:", req.body);
      
      const { type, difficulty } = req.body;

      if (!type || !difficulty) {
        return res.status(400).json({ 
          error: "Interview type and difficulty are required." 
        });
      }

      // Validate inputs
      const validTypes = ["hr", "technical", "coding"];
      const validDifficulties = ["easy", "medium", "hard"];

      if (!validTypes.includes(type)) {
        return res.status(400).json({ 
          error: "Invalid interview type. Must be: hr, technical, or coding" 
        });
      }

      if (!validDifficulties.includes(difficulty)) {
        return res.status(400).json({ 
          error: "Invalid difficulty. Must be: easy, medium, or hard" 
        });
      }

      // Generate questions using Gemini AI
      const questions = await generateQuestionsAI(type, difficulty);

      console.log("✅ Successfully generated", questions.length, "questions");
      res.json({ questions });

    } catch (error) {
      console.error("❌ Error generating mock interview questions:", error.message);
      
      if (error.message?.includes("API_KEY_INVALID")) {
        return res.status(500).json({ 
          error: "Invalid API key. Please check your Gemini API key configuration."
        });
      }
      
      if (error.message?.includes("QUOTA_EXCEEDED")) {
        return res.status(429).json({ 
          error: "API quota exceeded. Please try again later."
        });
      }

      res.status(500).json({ 
        error: "Failed to generate questions.",
        details: error.message 
      });
    }
  }
);

// ===================================================
// 2️⃣ Submit Answers & Get Detailed Evaluation
// ===================================================
router.post(
  "/submit-answers",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    const client = await db.connect();
    try {
      console.log("📝 Starting answer evaluation...");
      const { type, difficulty, questions, answers } = req.body;
      const userId = req.user.userId;

      console.log("📊 Request data:", {
        type,
        difficulty,
        userId,
        questionsCount: questions?.length,
        answersCount: answers?.length
      });

      if (!type || !difficulty || !questions || !answers) {
        return res.status(400).json({ error: "Missing required data." });
      }

      if (!Array.isArray(questions) || !Array.isArray(answers)) {
        return res.status(400).json({ 
          error: "Questions and answers must be arrays." 
        });
      }

      if (questions.length !== answers.length) {
        return res.status(400).json({ 
          error: "Number of questions and answers must match." 
        });
      }

      // Prepare questions array (extract text if objects)
      const questionTexts = questions.map(q => 
        typeof q === 'string' ? q : q.question || q.text || String(q)
      );

      // Get evaluation from Gemini AI
      const evaluation = await evaluateAnswersAI(
        type, 
        difficulty, 
        questionTexts, 
        answers
      );

      const score = Number(evaluation.score) || 0;
      const overallFeedback = evaluation.overallFeedback || "No overall feedback provided.";
      const questionWiseAnalysis = Array.isArray(evaluation.questionWiseAnalysis)
        ? evaluation.questionWiseAnalysis
        : [];
      const finalSuggestions = evaluation.finalSuggestions || "No final suggestions provided.";

      await client.query("BEGIN");

      // Save attempt to database
      const insertQuery = `
        INSERT INTO mock_interview_attempts (
          user_id, interview_type, difficulty, 
          questions, answers, score,
          overall_feedback, question_wise_analysis, final_suggestions
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING attempt_id, created_at
      `;

      const result = await client.query(insertQuery, [
        userId,
        type,
        difficulty,
        JSON.stringify(questionTexts),
        JSON.stringify(answers),
        score,
        overallFeedback,
        JSON.stringify(questionWiseAnalysis),
        finalSuggestions
      ]);

      await client.query("COMMIT");

      console.log("💾 Attempt saved to database");

      // Send full analytics to frontend
      res.json({
        attemptId: result.rows[0].attempt_id,
        score,
        overallFeedback,
        questionWiseAnalysis,
        finalSuggestions,
        createdAt: result.rows[0].created_at
      });

    } catch (error) {
      await client.query("ROLLBACK");
      console.error("🔥 Error scoring and saving answers:", error);
      
      if (error.message?.includes("API_KEY_INVALID")) {
        return res.status(500).json({ 
          error: "Invalid API key. Please check your Gemini API key configuration."
        });
      }
      
      res.status(500).json({ 
        error: "Failed to score and save the interview.",
        details: error.message 
      });
    } finally {
      client.release();
    }
  }
);

// ===================================================
// 3️⃣ Fetch Interview History for logged-in student
// ===================================================
router.get(
  "/history",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    try {
      const userId = req.user.userId;

      const query = `
        SELECT 
          attempt_id,
          interview_type,
          difficulty,
          score,
          overall_feedback,
          final_suggestions,
          created_at
        FROM mock_interview_attempts
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
      `;

      const result = await db.query(query, [userId]);

      res.json({ 
        attempts: result.rows,
        total: result.rowCount 
      });

    } catch (error) {
      console.error("Error fetching interview history:", error);
      res.status(500).json({ error: "Failed to fetch interview history." });
    }
  }
);

// ===================================================
// 4️⃣ Get Single Attempt Details (with full analysis)
// ===================================================
router.get(
  "/attempt/:attemptId",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const { attemptId } = req.params;

      const query = `
        SELECT 
          attempt_id,
          interview_type,
          difficulty,
          questions,
          answers,
          score,
          overall_feedback,
          question_wise_analysis,
          final_suggestions,
          created_at
        FROM mock_interview_attempts
        WHERE attempt_id = $1 AND user_id = $2
        LIMIT 1
      `;

      const result = await db.query(query, [attemptId, userId]);

      if (result.rowCount === 0) {
        return res.status(404).json({ 
          error: "Attempt not found or you don't have access." 
        });
      }

      res.json(result.rows[0]);

    } catch (error) {
      console.error("Error fetching attempt details:", error);
      res.status(500).json({ error: "Failed to fetch attempt details." });
    }
  }
);

export default router;