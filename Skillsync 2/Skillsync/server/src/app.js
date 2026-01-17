import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import db from "./config/db.js";

dotenv.config();

import registerRoutes from "./routes/register.routes.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import studentRoutes from "./routes/students.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import instructorRoutes from "./routes/instructor.routes.js";
import courseRoutes from "./routes/course.routes.js"; // NEW
import mockInterviewRoutes from "./routes/mockInterview.routes.js";



const app = express();


const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      callback(null, true); // Still allow it for development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');

if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});



// Routes
app.use("/api/instructor", instructorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/register", registerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes); // NEW - Course enrollment routes
app.use("/api/mock-interviews", mockInterviewRoutes); // ✅ NEW ROUTE

// Database check
db.query("SELECT NOW()")
  .then((res) => console.log("✅ Database connected at:", res.rows[0].now))
  .catch((err) => console.error("❌ Database connection failed:", err.message));


app.get("/", (req, res) => {
  res.json({ 
    message: "SkillSync API Running",
    mockInterviews: "enabled",
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    cors: "enabled",
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
})

// Multer error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Profile photo must be less than 2 MB" });
    }
  }
  next(err);
});

export default app;