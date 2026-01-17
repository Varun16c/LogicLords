import { useParams, useNavigate } from "react-router-dom";
import { generateQuestions } from "../../services/mockInterviewService";

function MockInterviewLevels() {
  const { type } = useParams();
  const navigate = useNavigate();

  const startInterview = async (difficulty) => {
    try {
      console.log("TYPE:", type);
      console.log("DIFFICULTY:", difficulty);

      const data = await generateQuestions(type, difficulty);

      console.log("BACKEND RESPONSE:", data);

      // ✅ FIX: Extract questions array properly
      const questions = data.questions;

      // ✅ FIX: Validate questions is an array
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Invalid questions format received from backend");
      }

      console.log("✅ QUESTIONS ARRAY:", questions);

      navigate("/student/mock-interviews/session", {
        state: {
          type,
          difficulty,
          questions: questions // ✅ Pass only the array
        }
      });
    } catch (err) {
      console.error("FULL ERROR:", err);
      console.error("ERROR RESPONSE:", err?.response);
      console.error("ERROR DATA:", err?.response?.data);

      alert(err.message || "Failed to generate questions");
    }
  };

  return (
    <div style={{ padding: "40px", background: "#f9fafb", minHeight: "100vh" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "32px",
          maxWidth: "600px",
          margin: "0 auto",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>
          {type.toUpperCase()} Interview
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "32px" }}>
          Select difficulty level to start
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <button
            onClick={() => startInterview("easy")}
            style={{
              padding: "16px",
              fontSize: "16px",
              fontWeight: "600",
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "0.2s"
            }}
            onMouseEnter={(e) => (e.target.style.background = "#059669")}
            onMouseLeave={(e) => (e.target.style.background = "#10b981")}
          >
            Easy
          </button>

          <button
            onClick={() => startInterview("medium")}
            style={{
              padding: "16px",
              fontSize: "16px",
              fontWeight: "600",
              background: "#f59e0b",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "0.2s"
            }}
            onMouseEnter={(e) => (e.target.style.background = "#d97706")}
            onMouseLeave={(e) => (e.target.style.background = "#f59e0b")}
          >
            Medium
          </button>

          <button
            onClick={() => startInterview("hard")}
            style={{
              padding: "16px",
              fontSize: "16px",
              fontWeight: "600",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "0.2s"
            }}
            onMouseEnter={(e) => (e.target.style.background = "#dc2626")}
            onMouseLeave={(e) => (e.target.style.background = "#ef4444")}
          >
            Hard
          </button>
        </div>

        <button
          onClick={() => navigate("/student/mock-interviews")}
          style={{
            marginTop: "24px",
            padding: "12px",
            fontSize: "14px",
            background: "#e5e7eb",
            color: "#374151",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            width: "100%"
          }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

export default MockInterviewLevels;