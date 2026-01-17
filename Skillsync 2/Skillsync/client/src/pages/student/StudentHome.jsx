import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";

function StudentHome() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/api/students/me");
        setStudent(res.data);
        setError(null);
      } catch (e) {
        console.error("Error fetching student data:", e);
        setError(e.response?.data?.error || "Failed to load student data");
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-card full-width" style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "18px", color: "#6b7280" }}>Loading your profile...</div>
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
        <h3 style={{ color: "#dc2626", marginBottom: "12px" }}>⚠️ Error Loading Profile</h3>
        <p style={{ color: "#991b1b" }}>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            marginTop: "16px",
            padding: "8px 16px",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="dashboard-card full-width" style={{ 
        textAlign: "center", 
        padding: "40px",
        background: "#fffbeb",
        borderLeft: "6px solid #f59e0b"
      }}>
        <h3 style={{ color: "#92400e" }}>📋 Profile Incomplete</h3>
        <p style={{ color: "#78350f", marginTop: "12px" }}>
          Your student profile has not been set up yet. Please contact your instructor.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Profile Overview */}
      <div
        className="dashboard-card full-width"
        style={{
          background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
          borderLeft: "6px solid #4f46e5",
          marginBottom: "20px"
        }}
      >
        <h3 style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: "8px" }}>
          👤 Profile Overview
        </h3>

        <div className="ms-form-grid">
          <div><b>Name:</b> {student.name || "—"}</div>
          <div><b>Email:</b> {student.email || "—"}</div>
          <div><b>Roll No:</b> {student.roll_no || "—"}</div>
          <div><b>Department:</b> {student.department || "—"}</div>
          <div><b>Year:</b> {student.year_of_study || "—"}</div>
          <div>
            <b>CGPA:</b>{" "}
            <span
              style={{
                padding: "4px 8px",
                borderRadius: 6,
                background: student.cgpa >= 7 ? "#dcfce7" : "#fef2f2",
                color: student.cgpa >= 7 ? "#166534" : "#991b1b",
                fontWeight: 700
              }}
            >
              {student.cgpa || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Academic Snapshot */}
      <div className="dashboard-card full-width" style={{ marginBottom: "20px" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          📊 Academic Snapshot
        </h3>

        <div className="ms-form-grid" style={{ marginTop: "16px" }}>
          <div><b>College:</b> {student.college || "—"}</div>
          <div><b>Admission Year:</b> {student.admission_year || "—"}</div>
          <div><b>Graduate Year:</b> {student.graduate_year || "—"}</div>
          <div><b>10th Marks:</b> {student.marks_10 || "—"}%</div>
          <div><b>12th Marks:</b> {student.marks_12 || "—"}%</div>
          <div>
            <b>Backlogs:</b>{" "}
            <span
              style={{
                color: student.backlogs > 0 ? "#dc2626" : "#16a34a",
                fontWeight: 700
              }}
            >
              {student.backlogs || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Skills & Projects */}
      <div className="dashboard-card full-width" style={{
        background: "#f0fdf4",
        borderLeft: "6px solid #16a34a"
      }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          💡 Skills & Experience
        </h3>

        <div style={{ marginTop: "16px" }}>
          <div style={{ marginBottom: "12px" }}>
            <b>Skills:</b>
            <p style={{ marginTop: "4px", color: "#374151" }}>
              {student.skills || "No skills listed"}
            </p>
          </div>
          
          <div style={{ marginBottom: "12px" }}>
            <b>Certifications:</b>
            <p style={{ marginTop: "4px", color: "#374151" }}>
              {student.certifications || "No certifications listed"}
            </p>
          </div>
          
          <div>
            <b>Projects:</b>
            <p style={{ marginTop: "4px", color: "#374151" }}>
              {student.projects || "No projects listed"}
            </p>
          </div>
        </div>
      </div>

      {/* Placement Status */}
      <div className="dashboard-card full-width" style={{
        background: "#fefce8",
        borderLeft: "6px solid #eab308",
        marginTop: "20px"
      }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          🎯 Career Preferences
        </h3>

        <div className="ms-form-grid" style={{ marginTop: "16px" }}>
          <div>
            <b>Placement Status:</b>{" "}
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 12,
                background: student.placement_status === "Placed" ? "#dcfce7" : "#e0e7ff",
                color: student.placement_status === "Placed" ? "#166534" : "#3730a3",
                fontWeight: 600
              }}
            >
              {student.placement_status || "Not Placed"}
            </span>
          </div>
          <div><b>Preferred Roles:</b> {student.job_roles || "—"}</div>
          <div><b>Preferred Locations:</b> {student.job_locations || "—"}</div>
          <div>
            <b>Resume:</b>{" "}
            {student.resume_url ? (
              <a 
                href={student.resume_url} 
                target="_blank" 
                rel="noreferrer"
                style={{ color: "#4f46e5", textDecoration: "underline" }}
              >
                View Resume
              </a>
            ) : (
              <span style={{ color: "#6b7280" }}>Not uploaded</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default StudentHome;