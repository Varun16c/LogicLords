import { useNavigate } from "react-router-dom";

function MockInterviews() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", background: "#f9fafb", minHeight: "100vh" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "32px",
          maxWidth: "1100px",
          margin: "0 auto",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}
      >
        <h1 style={{ fontSize: "32px", fontWeight: "700" }}>
          Mock Interviews
        </h1>

        <p style={{ color: "#6b7280", marginTop: "8px", marginBottom: "24px" }}>
          Practice by choosing interview type and difficulty level.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "24px"
          }}
        >
          <InterviewCard
            title="HR Interview"
            description="Practice behavioral and communication-based questions."
            icon="👤"
            onClick={() => navigate("/student/mock-interviews/hr")}
          />

          <InterviewCard
            title="Technical Interview"
            description="Domain-specific questions on DBMS, OS, OOPs, etc."
            icon="💻"
            onClick={() => navigate("/student/mock-interviews/technical")}
          />

          <InterviewCard
            title="Coding Interview"
            description="Solve coding challenges in real-time."
            icon="🧠"
            onClick={() => navigate("/student/mock-interviews/coding")}
          />
        </div>
      </div>
    </div>
  );
}

function InterviewCard({ title, description, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#f9fafb",
        borderRadius: "12px",
        padding: "24px",
        cursor: "pointer",
        border: "1px solid #e5e7eb",
        transition: "0.3s"
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.08)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div style={{ fontSize: "32px", marginBottom: "12px" }}>{icon}</div>
      <h3 style={{ fontSize: "18px", fontWeight: "600" }}>{title}</h3>
      <p style={{ color: "#6b7280", marginTop: "8px" }}>{description}</p>
    </div>
  );
}

export default MockInterviews;