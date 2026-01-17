import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Attempt from "../models/Attempt.js";
import auth from "../middleware/authMiddleware.js";

dotenv.config();
const router = express.Router();

/**
 * Initialize Gemini with validation
 */
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is not set in environment variables");
  throw new Error("GEMINI_API_KEY is required");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * ✅ Safe JSON extractor for Gemini responses
 */
const extractJsonFromText = (rawText) => {
  try {
    // Remove markdown code blocks
    let cleanText = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    // Try to find JSON object or array
    const jsonMatch = cleanText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Failed to extract JSON from text:", rawText.substring(0, 200));
    throw new Error("Gemini response does not contain valid JSON");
  }
};

// ===================================================
// 1️⃣ Generate Mock Interview Questions
// ===================================================
router.post("/generate-questions", async (req, res) => {
  try {
    console.log("🎯 Generating questions for:", req.body);
    
    const { type, difficulty } = req.body;

    if (!type || !difficulty) {
      return res
        .status(400)
        .json({ error: "Interview type and difficulty are required." });
    }

    // Validate API key before making request
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY is missing");
      return res.status(500).json({ 
        error: "API key is not configured. Please check server configuration." 
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite"
    });

    const prompt = `
You are a senior interviewer.

Generate exactly 5 mock interview questions.

Interview Type: ${type}
Difficulty Level: ${difficulty}

Rules:
- HR: Behavioral & situational questions
- Technical: DSA, DBMS, OS, OOPS concepts
- Coding: Clear coding problem statements

Return ONLY a valid JSON array with this structure:
[
  {
    "id": 1,
    "question": "Question text here",
    "type": "${type}",
    "difficulty": "${difficulty}"
  }
]

No markdown formatting, no explanations, just the JSON array.
`;

    console.log("🤖 Calling Gemini API...");
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    
    console.log("📝 Gemini response (first 200 chars):", rawText.substring(0, 200));

    // Clean and parse response
    const text = rawText.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(text);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid response format from Gemini");
    }

    console.log("✅ Successfully generated", questions.length, "questions");
    res.json({ questions });

  } catch (error) {
    console.error("❌ Error generating mock interview questions:", error.message);
    
    // Provide more specific error messages
    if (error.message?.includes("API_KEY_INVALID")) {
      return res.status(500).json({ 
        error: "Invalid API key. Please check your Gemini API key configuration.",
        details: "The API key provided is not valid or has expired."
      });
    }
    
    if (error.message?.includes("QUOTA_EXCEEDED")) {
      return res.status(429).json({ 
        error: "API quota exceeded. Please try again later.",
        details: "The Gemini API quota has been exceeded."
      });
    }

    res.status(500).json({ 
      error: "Failed to generate questions.",
      details: error.message 
    });
  }
});

// ===================================================
// 2️⃣ Submit Answers & ADVANCED Evaluation
// ===================================================
router.post("/submit-answers", auth, async (req, res) => {
  try {
    console.log("📝 Starting answer evaluation...");
    const { type, difficulty, questions, answers } = req.body;
    const userId = req.userId;

    console.log("📊 Request data:", {
      type,
      difficulty,
      userId,
      questionsCount: questions?.length,
      answersCount: answers?.length
    });

    if (!type || !difficulty || !questions || !answers) {
      console.log("❌ Missing required data");
      return res.status(400).json({ error: "Missing required data." });
    }

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY is missing");
      return res.status(500).json({ 
        error: "API key is not configured. Please check server configuration." 
      });
    }

    // Prepare Q&A for Gemini
    const evaluationContent = questions
      .map(
        (q, i) =>
          `Q${i + 1}: ${q}\nAnswer: ${answers[i] || "No answer provided"}`
      )
      .join("\n\n");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite"
    });

    const prompt = `
You are an expert interview evaluator and career coach.

Interview Type: ${type}
Difficulty Level: ${difficulty}

Below are the interview questions and the candidate's answers.

${evaluationContent}

========================
EVALUATION RULES
========================

1. Validate each answer:
- Empty / very short (<2 meaningful lines) → Poor
- Off-topic → Irrelevant

2. Check relevance, clarity, confidence, and professionalism.

3. Interview-type specific evaluation:
- HR → STAR method, communication, confidence
- Technical → correctness, depth, concepts
- Coding → logic, approach, edge cases, optimization

========================
OUTPUT FORMAT (STRICT JSON)
========================

{
  "score": 0-50,
  "overallFeedback": "Overall summary feedback",
  "questionWiseAnalysis": [
    {
      "question": "Question text",
      "answerQuality": "Poor | Average | Good | Excellent",
      "relevance": "Relevant | Partially Relevant | Irrelevant",
      "toneAndClarity": "Poor | Average | Good | Excellent",
      "feedback": "What was good or wrong",
      "improvementSuggestion": "How to improve"
    }
  ],
  "finalSuggestions": "Overall interview improvement tips"
}

IMPORTANT:
- Respond ONLY with valid JSON
- No markdown
- No explanations
`;

    console.log("🤖 Calling Gemini API for evaluation...");
    const result = await model.generateContent(prompt);

    const rawText = result.response.text();
    console.log("🔴 GEMINI RAW RESPONSE:", rawText.substring(0, 200) + "...");

    const evaluation = extractJsonFromText(rawText);
    console.log("✅ PARSED EVALUATION:", evaluation);

    // ✅ Safety fallbacks
    const score = Number(evaluation.score) || 0;
    const overallFeedback =
      evaluation.overallFeedback || "No overall feedback provided.";

    const questionWiseAnalysis = Array.isArray(
      evaluation.questionWiseAnalysis
    )
      ? evaluation.questionWiseAnalysis
      : [];

    const finalSuggestions =
      evaluation.finalSuggestions || "No final suggestions provided.";

    // Save attempt
    const newAttempt = new Attempt({
      userId,
      type,
      difficulty,
      questions,
      answers,
      score,
      overallFeedback,
      questionWiseAnalysis,
      finalSuggestions
    });

    await newAttempt.save();
    console.log("💾 Attempt saved to database");

    // Send full analytics to frontend
    res.json({
      score,
      overallFeedback,
      questionWiseAnalysis,
      finalSuggestions
    });
  } catch (error) {
    console.error("🔥 Error scoring and saving answers:", error);
    
    // Provide specific error messages
    if (error.message?.includes("API_KEY_INVALID")) {
      return res.status(500).json({ 
        error: "Invalid API key. Please check your Gemini API key configuration."
      });
    }
    
    res.status(500).json({ 
      error: "Failed to score and save the interview.",
      details: error.message 
    });
  }
});

// ===================================================
// 3️⃣ Fetch Interview History
// ===================================================
router.get("/history", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const attempts = await Attempt.find({ userId }).sort({
      createdAt: -1
    });

    res.json({ attempts });
  } catch (error) {
    console.error("Error fetching interview history:", error);
    res.status(500).json({ error: "Failed to fetch interview history." });
  }
});

export default router;