import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* =========================
   GENERATE QUESTIONS
========================= */
export const generateQuestionsAI = async (type, difficulty) => {
  try {
    console.log(`🎯 Generating ${difficulty} ${type} questions...`);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const prompt = `Generate exactly 5 ${difficulty} level ${type} interview questions.
Return ONLY a JSON array of strings, nothing else.
Example format: ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]

No markdown, no code blocks, no explanations - just the JSON array.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    console.log("🔴 GEMINI RAW RESPONSE:\n", rawText);

    // Remove markdown code blocks if present
    let cleanText = rawText.trim();
    cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    console.log("🧹 CLEANED TEXT:\n", cleanText);

    // Try to find JSON array
    const match = cleanText.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error("❌ No JSON array found in response");
      throw new Error("No JSON array found in Gemini response");
    }

    const questions = JSON.parse(match[0]);
    
    console.log("✅ PARSED QUESTIONS:", questions);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid questions format from Gemini");
    }

    return questions;

  } catch (err) {
    console.error("🔥 GEMINI FAILURE:", err);
    console.error("Error details:", err.message);
    throw err;
  }
};


/* =========================
   EVALUATE ANSWERS - DETAILED
========================= */
export const evaluateAnswersAI = async (type, difficulty, questions, answers) => {
  try {
    console.log("📊 Evaluating answers...");
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const qaText = questions
      .map(
        (q, i) =>
          `Q${i + 1}: ${q}\nAnswer: ${answers[i] || "No answer provided"}`
      )
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
${type === 'HR' ? '- Evaluate STAR method usage, confidence, and communication skills' : ''}
${type === 'Technical' ? '- Evaluate technical accuracy, depth of knowledge, and explanation clarity' : ''}
${type === 'Coding' ? '- Evaluate logic, approach, edge cases consideration, and optimization' : ''}

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
    const response = await result.response;
    const rawText = response.text();

    console.log("🔴 EVALUATION RAW RESPONSE:\n", rawText);

    // Remove markdown if present
    let cleanText = rawText.trim();
    cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Extract JSON
    const match = cleanText.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Gemini did not return evaluation JSON");
    }

    const evaluation = JSON.parse(match[0]);
    console.log("✅ PARSED EVALUATION:", evaluation);

    return evaluation;

  } catch (err) {
    console.error("🔥 EVALUATION FAILURE:", err);
    throw err;
  }
};