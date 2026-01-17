import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/auth.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:5000/auth/register", {
        name,
        email,
        password,
        role
      });

      alert("Registration successful. Please login.");
      navigate("/");
    } catch {
      alert("User already exists");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>SkillSync Register</h2>

        <input
          placeholder="Full Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <select onChange={(e) => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="recruiter">Recruiter</option>
        </select>

        <button onClick={handleRegister}>Register</button>

        <div className="auth-footer">
          Already registered?{" "}
          <span onClick={() => navigate("/")}>Login</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
