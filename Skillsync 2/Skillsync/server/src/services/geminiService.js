// server/services/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extract JSON from Gemini response text
 */
const extractJsonFromText = (rawText) => {
  try {
    let cleanText = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
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

/**
 * Generate Mock Interview Questions
 */
export const generateQuestionsAI = async (type, difficulty) => {
  try {
    console.log(`🎯 Generating ${difficulty} ${type} questions...`);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest"
    });

    const prompt = `You are a senior interviewer.

Generate exactly 5 mock interview questions.

Interview Type: ${type}
Difficulty Level: ${difficulty}

Rules:
- HR: Behavioral & situational questions (e.g., "Tell me about a time when...", "How do you handle...")
- Technical: DSA, DBMS, OS, OOPS concepts (e.g., "Explain the difference between...", "What is...")
- Coding: Clear coding problem statements (e.g., "Write a function to...", "Implement...")

Return ONLY a valid JSON array with this structure:
[
  {
    "id": 1,
    "question": "Question text here",
    "type": "${type}",
    "difficulty": "${difficulty}"
  }
]

No markdown formatting, no explanations, just the JSON array.`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    
    console.log("📝 Gemini response (first 200 chars):", rawText.substring(0, 200));

    const text = rawText.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(text);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid response format from Gemini");
    }

    console.log("✅ Successfully generated", questions.length, "questions");
    return questions;

  } catch (err) {
    console.error("🔥 GEMINI FAILURE:", err.message);
    throw err;
  }
};

/**
 * Evaluate Interview Answers - DETAILED
 */
export const evaluateAnswersAI = async (type, difficulty, questions, answers) => {
  try {
    console.log("📊 Evaluating answers...");
    
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest"
    });

    const qaText = questions
      .map((q, i) => `Q${i + 1}: ${q}\nAnswer: ${answers[i] || "No answer provided"}`)
      .join("\n\n");

    const prompt = `You are an expert interview evaluator and career coach.

Interview Type: ${type}
Difficulty Level: ${difficulty}

Below are the interview questions and the candidate's answers:

${qaText}

Perform a DETAILED evaluation focusing on:
1. Answer relevance to the question
2. Communication tone and professionalism
3. Completeness and clarity
4. Specific areas for improvement

For ${type} interviews specifically:
${type === 'hr' ? '- Evaluate STAR method usage, confidence, and communication skills' : ''}
${type === 'technical' ? '- Evaluate technical accuracy, depth of knowledge, and explanation clarity' : ''}
${type === 'coding' ? '- Evaluate logic, approach, edge cases consideration, and optimization' : ''}

Return ONLY valid JSON (no markdown, no code blocks) in this EXACT format:
{
  "score": 35,
  "overallFeedback": "Brief summary of overall performance",
  "questionWiseAnalysis": [
    {
      "question": "Full question text",
      "answerQuality": "Poor|Average|Good|Excellent",
      "relevance": "Relevant|Partially Relevant|Irrelevant",
      "toneAndClarity": "Poor|Average|Good|Excellent",
      "feedback": "What was good or wrong with this specific answer",
      "improvementSuggestion": "Specific actionable suggestion to improve this answer"
    }
  ],
  "finalSuggestions": "Overall tips for interview improvement"
}

IMPORTANT:
- Be honest and constructive
- Empty or very short answers (<2 lines) should be marked as "Poor"
- Off-topic answers should be marked as "Irrelevant"
- Provide specific, actionable improvement suggestions`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    console.log("🔴 EVALUATION RAW RESPONSE (first 200):", rawText.substring(0, 200));

    const evaluation = extractJsonFromText(rawText);
    console.log("✅ PARSED EVALUATION");

    return evaluation;

  } catch (err) {
    console.error("🔥 EVALUATION FAILURE:", err.message);
    throw err;
  }
};