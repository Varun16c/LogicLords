import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isRegister ? "/register" : "/login";
      const body = isRegister 
        ? { name, email, password } 
        : { email, password };

      const res = await fetch(`http://localhost:5000/api/auth${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        alert(isRegister ? "Registration successful!" : "Login successful!");
        navigate("/student/mock-interviews");
      } else {
        alert(data.error || "Failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "0 auto" }}>
      <h1>{isRegister ? "Register" : "Login"}</h1>
      
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div style={{ marginBottom: "15px" }}>
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </div>
        )}

        <div style={{ marginBottom: "15px" }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: "10px 20px", cursor: "pointer", marginRight: "10px" }}
        >
          {loading ? "Please wait..." : (isRegister ? "Register" : "Login")}
        </button>

        <button
          type="button"
          onClick={() => setIsRegister(!isRegister)}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          {isRegister ? "Already have account? Login" : "Need account? Register"}
        </button>
      </form>
    </div>
  );
}

export default Login;