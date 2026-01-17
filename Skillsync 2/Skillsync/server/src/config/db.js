import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "Ayush@123",
  database: "skillsync",
  port: 5432,
});

export default pool;   // ✅ THIS LINE IS REQUIRED
