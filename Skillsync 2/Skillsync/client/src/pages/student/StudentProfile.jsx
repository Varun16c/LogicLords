import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";

function StudentProfile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/api/students/me");
        setStudent(res.data);
        setError(null);
      } catch (e) {
        console.error("Error fetching profile:", e);
        setError(e.response?.data?.error || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-card full-width" style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "18px", color: "#6b7280" }}>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-card full-width" style={{ 
        background: "#fef2f2", 
        borderLeft: "6px solid #dc2626",
        padding: "24px"
      }}>
        <h3 style={{ color: "#dc2626" }}>⚠️ Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="dashboard-card full-width" style={{ textAlign: "center", padding: "40px" }}>
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Personal Information */}
      <div className="dashboard-card full-width" style={{
        background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
        borderLeft: "6px solid #4f46e5"
      }}>
        <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          👤 Personal Information
        </h3>
        <div className="ms-form-grid">
          <div>
            <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              Full Name
            </label>
            <div style={{ fontWeight: 600 }}>{student.name || "—"}</div>
          </div>
          <div>
            <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              Email
            </label>
            <div style={{ fontWeight: 600 }}>{student.email || "—"}</div>
          </div>
          <div>
            <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              Date of Birth
            </label>
            <div style={{ fontWeight: 600 }}>
              {student.dob ? new Date(student.dob).toLocaleDateString() : "—"}
            </div>
          </div>
          <div>
            <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              Gender
            </label>
            <div style={{ fontWeight: 600 }}>{student.gender || "—"}</div>
          </div>
          <div>
            <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              Contact
            </label>
            <div style={{ fontWeight: 600 }}>{student.contact || "—"}</div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              Address
            </label>
            <div style={{ fontWeight: 600 }}>{student.address || "—"}</div>
          </div>
        </div>
      </div>

      {/* Academic Details */}
      <div className="dashboard-card full-width" style={{
        background: "#f0fdf4",
        borderLeft: "6px solid #16a34a"
      }}>
        <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          🎓 Academic Details
        </h3>
        <div className="ms-form-grid">
          <div>
            <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              Roll Number
            </label>
            <div style={{ fontWeight: 600 }}>{student.roll_no || "—"}</div>
          </div>
          <div>
            <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              College
            </label>
            <div style={{ fontWeight: 600 }}>{student.college || "—"}</div>
          </div>
          <div>
            <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              Department
            </label>
            <div style={{ fontWeight: 600 }}>{student.department || "—"}</div>
          </div>
          <div>
            <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              Year of Study
            </label>
            <div style={{ fontWeight: 600 }}>{student.year_of_study || "—"}</div>
          </div>
          <div>
            <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              Admission Year
            </label>
            <div style={{ fontWeight: 600 }}>{student.admission_year || "—"}</div>
          </div>
          <div>
            <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              Graduate Year
            </label>
            <div style={{ fontWeight: 600 }}>{student.graduate_year || "—"}</div>
          </div>
        </div>
      </div>

      {/* Academic Performance */}
      <div className="dashboard-card full-width" style={{
        background: "#fff7ed",
        borderLeft: "6px solid #f97316"
      }}>
        <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          📊 Academic Performance
        </h3>
        <div className="ms-form-grid">
          <div>
            <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              CGPA
            </label>
            <div style={{
              fontWeight: 700,
              fontSize: "24px",
              color: student.cgpa >= 8 ? "#16a34a" : student.cgpa >= 6 ? "#f59e0b" : "#dc2626"
            }}>
              {student.cgpa || "—"}
            </div>
          </div>
          <div>
            <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              10th Marks
            </label>
            <div style={{ fontWeight: 600, fontSize: "20px" }}>{student.marks_10 || "—"}%</div>
          </div>
          <div>
            <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              12th Marks
            </label>
            <div style={{ fontWeight: 600, fontSize: "20px" }}>{student.marks_12 || "—"}%</div>
          </div>
          <div>
            <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              Backlogs
            </label>
            <div style={{
              fontWeight: 700,
              fontSize: "20px",
              color: student.backlogs > 0 ? "#dc2626" : "#16a34a"
            }}>
              {student.backlogs || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Skills & Experience */}
      <div className="dashboard-card full-width">
        <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          💡 Skills & Experience
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ 
              fontSize: "14px", 
              fontWeight: 600, 
              color: "#374151",
              display: "block",
              marginBottom: "8px"
            }}>
              Technical Skills
            </label>
            <div style={{
              padding: "12px",
              background: "#f9fafb",
              borderRadius: "6px",
              border: "1px solid #e5e7eb"
            }}>
              {student.skills || "No skills listed"}
            </div>
          </div>

          <div>
            <label style={{ 
              fontSize: "14px", 
              fontWeight: 600, 
              color: "#374151",
              display: "block",
              marginBottom: "8px"
            }}>
              Certifications
            </label>
            <div style={{
              padding: "12px",
              background: "#f9fafb",
              borderRadius: "6px",
              border: "1px solid #e5e7eb"
            }}>
              {student.certifications || "No certifications listed"}
            </div>
          </div>

          <div>
            <label style={{ 
              fontSize: "14px", 
              fontWeight: 600, 
              color: "#374151",
              display: "block",
              marginBottom: "8px"
            }}>
              Projects
            </label>
            <div style={{
              padding: "12px",
              background: "#f9fafb",
              borderRadius: "6px",
              border: "1px solid #e5e7eb"
            }}>
              {student.projects || "No projects listed"}
            </div>
          </div>

          <div>
            <label style={{ 
              fontSize: "14px", 
              fontWeight: 600, 
              color: "#374151",
              display: "block",
              marginBottom: "8px"
            }}>
              Resume
            </label>
            {student.resume_url ? (
              <a 
                href={student.resume_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  background: "#4f46e5",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontWeight: 600
                }}
              >
                📄 View Resume
              </a>
            ) : (
              <div style={{
                padding: "12px",
                background: "#fef2f2",
                borderRadius: "6px",
                border: "1px solid #fecaca",
                color: "#991b1b"
              }}>
                Resume not uploaded
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Career Preferences */}
      <div className="dashboard-card full-width" style={{
        background: "#fefce8",
        borderLeft: "6px solid #eab308"
      }}>
        <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          🎯 Career Preferences
        </h3>
        
        <div className="ms-form-grid">
          <div>
            <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              Placement Status
            </label>
            <div style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: "20px",
              background: student.placement_status === "Placed" ? "#dcfce7" : "#e0e7ff",
              color: student.placement_status === "Placed" ? "#166534" : "#3730a3",
              fontWeight: 700
            }}>
              {student.placement_status || "Not Placed"}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              Preferred Job Roles
            </label>
            <div style={{ fontWeight: 600 }}>{student.job_roles || "—"}</div>
          </div>
          <div>
            <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
              Preferred Locations
            </label>
            <div style={{ fontWeight: 600 }}>{student.job_locations || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;