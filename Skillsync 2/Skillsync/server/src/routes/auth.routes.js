import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      "SELECT id, name, email, password, role FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 🔐 BLOCK UNAPPROVED INSTRUCTORS
if (user.role === "instructor") {
  const instResult = await db.query(
    "SELECT approval_status FROM instructors WHERE user_id = $1",
    [user.id]
  );

  if (
    instResult.rowCount === 0 ||
    instResult.rows[0].approval_status !== "APPROVED"
  ) {
    return res.status(403).json({
      error: "Your instructor account is pending admin approval"
    });
  }
}




    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      name: user.name
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
