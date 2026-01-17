import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import auth from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import fs from "fs";
import mammoth from "mammoth";
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Extract text from PDF (FIXED with dynamic import)
const extractTextFromPDF = async (filePath) => {
  try {
    // Dynamic import of pdf-parse
    const pdfParse = (await import('pdf-parse')).default;
    const dataBuffer = readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || "";
  } catch (error) {
    console.error("❌ PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF");
  }
};

// ✅ Extract text from DOCX
const extractTextFromDOCX = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || "";
  } catch (error) {
    console.error("❌ DOCX extraction error:", error);
    throw new Error("Failed to extract text from DOCX");
  }
};

// ✅ Resume detection (NEW)
const isLikelyResume = (text) => {
  const resumeKeywords = [
    "resume",
    "curriculum vitae",
    "experience",
    "education",
    "skills",
    "projects",
    "certification",
    "internship",
    "objective",
    "summary"
  ];

  const lowerText = text.toLowerCase();
  const matchCount = resumeKeywords.filter(k =>
    lowerText.includes(k)
  ).length;

  return matchCount >= 3; // threshold
};

// ✅ Extract JSON from Gemini response
const extractJsonFromText = (rawText) => {
  try {
    let cleanText = rawText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const jsonMatch = cleanText.match(/(\{[\s\S]*\})/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Failed to extract JSON:", rawText.substring(0, 200));
    throw new Error("Invalid JSON response from AI");
  }
};

// ===================================================
// 1️⃣ Upload and Analyze Resume
// ===================================================
router.post(
  "/analyze",
  auth,
  upload.single("resume"),
  async (req, res) => {
    try {
      console.log("📄 Resume analysis started...");

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const userId = req.userId;
      const filePath = req.file.path;
      const fileName = req.file.originalname;
      const fileUrl = `/uploads/resumes/${req.file.filename}`;

      console.log("📁 File uploaded:", fileName);

      let extractedText = "";
      const fileExt = fileName.split(".").pop().toLowerCase();

      if (fileExt === "pdf") {
        extractedText = await extractTextFromPDF(filePath);
      } else if (fileExt === "docx" || fileExt === "doc") {
        extractedText = await extractTextFromDOCX(filePath);
      } else {
        return res.status(400).json({ error: "Unsupported file format" });
      }

      console.log("📝 Text extracted:", extractedText.substring(0, 200));

      // ✅ NEW: Reject non-resume documents
      if (!isLikelyResume(extractedText)) {
        return res.status(400).json({
          success: false,
          error: "Uploaded document is not a resume. Please upload a valid resume."
        });
      }

      // Analyze using Gemini
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite"
      });

      const prompt = `
You are an expert resume analyzer and ATS (Applicant Tracking System) specialist with 15+ years of recruiting experience.

Analyze the following resume text and provide a comprehensive analysis in STRICT JSON format.

Return a JSON object with the following EXACT structure:
{
  "overallScore": number (0-100),
  "atsScore": number (0-100),
  "personalInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string"
  },
  "summary": "string",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "duration": "string",
      "description": "string"
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "year": "string"
    }
  ],
  "skills": ["string"],
  "strengths": [
    "Detailed strength with explanation (e.g., 'Strong technical background in Python with 5+ years of hands-on experience')"
  ],
  "weaknesses": [
    "Specific weakness with explanation (e.g., 'Limited leadership experience mentioned for senior-level roles')"
  ],
  "suggestions": [
    "Actionable suggestion (e.g., 'Add metrics to your achievements - e.g., Increased sales by 25%')"
  ],
  "improvements": [
    {
      "category": "string (e.g., 'Skills Section', 'Experience Description', 'Formatting')",
      "issue": "string (what needs improvement)",
      "suggestion": "string (how to improve it)",
      "priority": "High/Medium/Low"
    }
  ],
  "recommendedJobRoles": [
    {
      "title": "string (specific job title)",
      "matchScore": number (0-100),
      "reasoning": "string (why this role fits)"
    }
  ],
  "skillsGapAnalysis": {
    "currentSkills": ["string (skills found in resume)"],
    "trendingSkills": ["string (in-demand skills missing from resume)"],
    "recommendedToLearn": ["string (skills to prioritize learning)"]
  },
  "missingCertifications": [
    {
      "name": "string (certification name)",
      "relevance": "string (why it's important for their career)",
      "priority": "High/Medium/Low"
    }
  ],
  "linkedInOptimization": [
    "Specific tip for improving LinkedIn profile (e.g., 'Add a professional headline with your key skills and target role')"
  ],
  "careerPathSuggestions": [
    {
      "path": "string (career direction, e.g., 'Technical Lead → Engineering Manager')",
      "timeline": "string (e.g., '2-3 years')",
      "requiredSkills": ["string"],
      "reasoning": "string (why this path makes sense)"
    }
  ],
  "sections": {
    "contactInfo": {
      "present": boolean,
      "score": number (0-100),
      "feedback": "string"
    },
    "summary": {
      "present": boolean,
      "score": number (0-100),
      "feedback": "string"
    },
    "experience": {
      "present": boolean,
      "score": number (0-100),
      "feedback": "string"
    },
    "education": {
      "present": boolean,
      "score": number (0-100),
      "feedback": "string"
    },
    "skills": {
      "present": boolean,
      "score": number (0-100),
      "feedback": "string"
    },
    "projects": {
      "present": boolean,
      "score": number (0-100),
      "feedback": "string"
    }
  },
  "keywords": {
    "found": ["string"],
    "missing": ["string"],
    "suggestions": ["string"]
  },
  "formatting": {
    "score": number (0-100),
    "feedback": "string"
  }
}

Resume Text:
${extractedText}

IMPORTANT INSTRUCTIONS:
1. Be specific and actionable in all feedback
2. Base job role recommendations on actual resume content
3. Suggest 3-5 realistic job roles with match scores
4. Include trending skills relevant to their industry
5. Recommend 3-5 certifications that add real career value
6. Provide 4-6 LinkedIn optimization tips
7. Suggest 2-3 realistic career paths based on their background
8. Provide at least 5 strengths and 5 weaknesses
9. Give 8-10 actionable suggestions
10. OUTPUT ONLY THE JSON OBJECT, NO MARKDOWN, NO EXPLANATION
`;

      console.log("🤖 Calling Gemini API...");
      const result = await model.generateContent(prompt);
      const rawText = result.response.text();

      console.log("📊 Raw Gemini Response:", rawText.substring(0, 500));

      const analysis = extractJsonFromText(rawText);
      
      console.log("✅ Parsed Analysis Keys:", Object.keys(analysis));
      console.log("📋 Analysis Data:", JSON.stringify(analysis, null, 2));

      const newAnalysis = new ResumeAnalysis({
        userId,
        fileName,
        fileUrl,
        extractedText,
        analysis
      });

      await newAnalysis.save();

      res.json({
        success: true,
        analysisId: newAnalysis._id,
        fileName,
        analysis
      });
    } catch (error) {
      console.error("❌ Error analyzing resume:", error);
      res.status(500).json({
        error: "Failed to analyze resume",
        details: error.message
      });
    }
  }
);

// ===================================================
// 2️⃣ Get Analysis History
// ===================================================
router.get("/history", auth, async (req, res) => {
  try {
    const analyses = await ResumeAnalysis.find({ userId: req.userId }).sort({
      createdAt: -1
    });
    res.json({ analyses });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// ===================================================
// 3️⃣ Get Single Analysis
// ===================================================
router.get("/:id", auth, async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    if (analysis.userId.toString() !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analysis" });
  }
});

// ===================================================
// 4️⃣ Delete Analysis
// ===================================================
router.delete("/:id", auth, async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    if (analysis.userId.toString() !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const filePath = `uploads/resumes/${analysis.fileUrl.split("/").pop()}`;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await ResumeAnalysis.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Analysis deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete analysis" });
  }
});

export default router;