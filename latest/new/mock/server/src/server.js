import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import authRoutes from "./routes/auth.js";
import resumeAnalyzerRoutes from "./routes/resumeAnalyzer.js";
/* =========================
   RESOLVE PATHS (ESM SAFE)
========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* =========================
   LOAD ENV (ONLY ONCE)
========================= */
dotenv.config({
  path: join(__dirname, "..", ".env")
});

/* =========================
   VALIDATE ENV VARIABLES
========================= */
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is NOT loaded");
  console.error("👉 Ensure .env exists in /server directory");
  process.exit(1);
}

console.log("✅ Gemini API key loaded");

// 🔍 CHECK JWT_SECRET
console.log("🔐 JWT_SECRET loaded:", process.env.JWT_SECRET ? "YES" : "NO");
if (!process.env.JWT_SECRET) {
  console.error("❌ WARNING: JWT_SECRET is missing! Authentication will fail.");
}

/* =========================
   IMPORTS (AFTER ENV)
========================= */
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import mockInterviewRoutes from "./routes/mockInterviews.js";

/* =========================
   CONNECT DATABASE
========================= */
connectDB();

/* =========================
   APP SETUP
========================= */
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/mock-interviews", mockInterviewRoutes);
app.use("/api/resume-analyzer", resumeAnalyzerRoutes);

app.get("/", (req, res) => {
  res.send("Mock Interview API Running");
});


import fs from "fs";
if (!fs.existsSync("uploads/resumes")) {
  fs.mkdirSync("uploads/resumes", { recursive: true });
}

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});