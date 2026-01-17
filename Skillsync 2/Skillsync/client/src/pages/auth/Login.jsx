import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= TOGGLE PASSWORD ================= */
  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  /* ================= LOGIN ================= */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email or password");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name);

      localStorage.setItem("token", data.token);
localStorage.setItem("role", data.role);
localStorage.setItem("name", data.name);

if (data.role === "student") {
  navigate("/student");
} else if (data.role === "instructor") {
  navigate("/instructor");
} else if (data.role === "admin") {
  navigate("/admin/dashboard");
} else {
  navigate("/");
}

    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* LEFT PANEL */}
        <div className="auth-left">
          <h1>SkillSync</h1>
          <p>
            A unified platform for students, instructors,
            recruiters, and administrators.
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="auth-right">
          <h2>Login</h2>

          {error && (
            <div style={{ color: "red", marginBottom: "15px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            <div className="auth-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* PASSWORD FIELD WITH TOGGLE */}
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: "40px" }}
              />

              <span
                className="password-toggle"
                onClick={togglePassword}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            <button className="auth-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          <div className="auth-footer">
            Not a student?{" "}
            <Link to="/register">Request access</Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
