const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/run", require("./routes/compilerRoutes"));
app.use("/exams", require("./routes/examRoutes"));
app.use("/submissions", require("./routes/submissionRoutes")); // ← ADD THIS LINE

app.listen(5000, () => {
  console.log("Server running on port 5000");
});