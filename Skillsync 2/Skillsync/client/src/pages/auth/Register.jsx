import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();

  /* ================= PASSWORD TOGGLE ================= */
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  /* ================= GENERAL STATE ================= */
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  /* ================= FILE VALIDATION ================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, JPEG, and PNG images are allowed");
      e.target.value = "";
      return;
    }

    if (file.size > maxSize) {
      setError("Profile photo must be less than 2 MB");
      e.target.value = "";
      return;
    }

    setError("");
    setProfilePhoto(file);
  };

  /* ================= VALIDATIONS ================= */
  const isValidEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@(gmail\.com|.+\.edu\.in)$/.test(email);


  const isValidPassword = (password) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(password);

  const isValidContact = (number) =>
    /^\d{10}$/.test(number);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint =
      role === "Instructor"
        ? "http://localhost:5000/api/register/instructor"
        : "http://localhost:5000/api/register/recruiter";

    try {
      if (!isValidEmail(formData.email)) {
        setError("Email must be a valid Gmail or college (.edu.in) email");
        return;
      }

      if (!isValidPassword(formData.password)) {
        setError(
          "Password must be at least 6 characters and include 1 uppercase letter, 1 number, and 1 special character"
        );
        return;
      }

      const contactRaw =
        role === "Instructor"
          ? formData.contactNumber
          : formData.contact_number;

      const contact = contactRaw?.replace(/\D/g, "");

      if (!isValidContact(contact)) {
        setError("Contact number must be exactly 10 digits");
        return;
      }

      if (role === "Instructor") {
        formData.contactNumber = contact;
      } else {
        formData.contact_number = contact;
      }

      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      data.append("profile_photo", profilePhoto);

      const res = await fetch(endpoint, {
        method: "POST",
        body: data
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Registration failed");
        return;
      }

      alert("Registration successful. Please login.");
      navigate("/");

    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= BACK BUTTON ================= */
  const BackToLogin = () => (
    <div style={{ marginTop: "15px", textAlign: "center" }}>
      <Link to="/" style={{ textDecoration: "none", color: "#555" }}>
        ← Back to Login
      </Link>
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* LEFT PANEL */}
        <div className="auth-left">
          <h1>Request Access</h1>
          <p>
            Only instructors and recruiters can create an account.
            Students are provided access by the institution.
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="auth-right">

          {!role && (
            <>
              <h2>Select Your Role</h2>
              <div style={{ display: "flex", gap: "20px" }}>
                <button className="auth-btn" onClick={() => setRole("Instructor")}>
                  Instructor
                </button>
                <button className="auth-btn" onClick={() => setRole("Recruiter")}>
                  Recruiter
                </button>
              </div>

              <BackToLogin />
            </>
          )}

          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

          {/* ================= INSTRUCTOR ================= */}
          {role === "Instructor" && (
            <>
              <h2>Instructor Registration</h2>

              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <input name="name" placeholder="Full Name" onChange={handleChange} required />
                <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
                <input name="contactNumber" placeholder="Contact Number" onChange={handleChange} required />

                <input type="file" name="profile_photo" accept="image/*" onChange={handleFileChange} required />

                <div style={{ position: "relative" }}>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    onChange={handleChange}
                    required
                    style={{ paddingRight: "40px" }}
                  />
                  <span className="password-toggle" onClick={togglePassword}>
                    {showPassword ? "Hide" : "Show"}
                  </span>
                </div>

                <input name="organisation" placeholder="Organisation" onChange={handleChange} required />
                <input name="designation" placeholder="Designation" onChange={handleChange} required />
                <input name="department" placeholder="Department" onChange={handleChange} required />
                <input name="expertise" placeholder="Expertise" onChange={handleChange} required />
                <input name="experience" type="number" placeholder="Experience (years)" onChange={handleChange} required />

                <button className="auth-btn" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Request"}
                </button>

                <BackToLogin />
              </form>
            </>
          )}

          {/* ================= RECRUITER ================= */}
          {role === "Recruiter" && (
            <>
              <h2>Recruiter Registration</h2>

              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <input name="recruiter_name" placeholder="Full Name" onChange={handleChange} required />

                <input type="file" name="profile_photo" accept="image/*" onChange={handleFileChange} required />

                <input name="email" type="email" placeholder="Email" onChange={handleChange} required />

                <div style={{ position: "relative" }}>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    onChange={handleChange}
                    required
                    style={{ paddingRight: "40px" }}
                  />
                  <span className="password-toggle" onClick={togglePassword}>
                    {showPassword ? "Hide" : "Show"}
                  </span>
                </div>

                <input name="contact_number" placeholder="Contact Number" onChange={handleChange} required />
                <input name="designation" placeholder="Designation" onChange={handleChange} required />
                <input name="company_name" placeholder="Company Name" onChange={handleChange} required />
                <input name="industry_type" placeholder="Industry Type" onChange={handleChange} required />
                <input name="website" placeholder="Company Website" onChange={handleChange} required />

                <button className="auth-btn" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Request"}
                </button>

                <BackToLogin />
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default Register;
