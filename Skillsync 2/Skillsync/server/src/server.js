
import dotenv from "dotenv";
dotenv.config();


console.log("🔍 Environment Check:");
console.log("✅ PORT:", process.env.PORT || 5000);
console.log("✅ JWT_SECRET:", process.env.JWT_SECRET ? "LOADED" : "❌ MISSING");
console.log("✅ GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "LOADED" : "❌ MISSING");
console.log("✅ DB_USER:", process.env.DB_USER ? "LOADED" : "❌ MISSING");


import app from "./app.js";
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "Profile photo must be less than 2 MB"
      });
    }
  }

  if (err.message.includes("Only JPG")) {
    return res.status(400).json({ error: err.message });
  }

  next(err);
});
export default app;