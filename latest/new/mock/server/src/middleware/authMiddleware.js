import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  console.log("🔐 JWT_SECRET during VERIFICATION:", process.env.JWT_SECRET ? "LOADED" : "MISSING");
  
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    console.log("❌ No authorization header or invalid format");
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];
  console.log("🎫 Token received:", token?.substring(0, 20) + "...");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified! Decoded payload:", decoded);
    console.log("✅ userId extracted:", decoded.id || decoded.userId);
    
    req.userId = decoded.id || decoded.userId;
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    res.status(403).json({ error: "Invalid token" });
  }
};

export default auth;