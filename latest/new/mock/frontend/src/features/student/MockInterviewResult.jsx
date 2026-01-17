import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MockInterviewResult = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  console.log("📋 STATE RECEIVED:", state);
  console.log("📋 EVALUATION:", state?.evaluation);

  // ✅ Better validation
  if (!state || !state.evaluation) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div
          style={{
            maxWidth: "500px",
            margin: "0 auto",
            padding: "32px",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#ef4444", marginBottom: "12px" }}>
            No Evaluation Data Found
          </h2>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>
            Please complete a mock interview first to see your results.
          </p>
          <button
            onClick={() => navigate("/student/mock-interviews")}
            style={{
              padding: "12px 24px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Go to Mock Interviews
          </button>
        </div>
      </div>
    );
  }

  const { type, difficulty, evaluation, questions, answers } = state;

  // ✅ Safe extraction with defaults
  const score = evaluation?.score || 0;
  const overallFeedback = evaluation?.overallFeedback || "No feedback available";
  const questionWiseAnalysis = evaluation?.questionWiseAnalysis || [];
  const finalSuggestions = evaluation?.finalSuggestions || "";

  // ✅ Score color helper
  const getScoreColor = (score) => {
    if (score >= 40) return "#10b981"; // Green
    if (score >= 25) return "#f59e0b"; // Orange
    return "#ef4444"; // Red
  };

  // ✅ Quality badge style helper
  const getQualityStyle = (quality) => {
    const styles = {
      Excellent: { bg: "#dcfce7", color: "#166534" },
      Good: { bg: "#dbeafe", color: "#1e40af" },
      Average: { bg: "#fef3c7", color: "#92400e" },
      Poor: { bg: "#fee2e2", color: "#991b1b" }
    };
    return styles[quality] || styles.Poor;
  };

  return (
    <div style={{ padding: "40px", background: "#f9fafb", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "12px",
          padding: "32px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>
            Interview Results
          </h1>
          <p style={{ color: "#6b7280", fontSize: "16px" }}>
            {type?.toUpperCase()} • <span style={{ textTransform: "capitalize" }}>{difficulty}</span>
          </p>
        </div>

        {/* Score Card */}
        <div
          style={{
            background: `linear-gradient(135deg, ${getScoreColor(score)} 0%, ${getScoreColor(score)}dd 100%)`,
            borderRadius: "12px",
            padding: "32px",
            marginBottom: "32px",
            textAlign: "center",
            color: "#fff",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
          }}
        >
          <p style={{ fontSize: "16px", opacity: 0.9, marginBottom: "8px" }}>
            Your Score
          </p>
          <p style={{ fontSize: "56px", fontWeight: "700", marginBottom: "16px" }}>
            {score}/50
          </p>
          <p style={{ fontSize: "18px", opacity: 0.95 }}>
            {overallFeedback}
          </p>
        </div>

        {/* Question-wise Analysis */}
        {questionWiseAnalysis.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "20px" }}>
              📊 Question-wise Analysis
            </h2>

            {questionWiseAnalysis.map((item, index) => {
              const qualityStyle = getQualityStyle(item.answerQuality);
              const clarityStyle = getQualityStyle(item.toneAndClarity);
              const userAnswer = answers?.[index] || "No answer provided";

              return (
                <div
                  key={index}
                  style={{
                    padding: "24px",
                    background: "#f9fafb",
                    borderRadius: "12px",
                    marginBottom: "20px",
                    border: "1px solid #e5e7eb"
                  }}
                >
                  {/* Question */}
                  <p style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
                    Question {index + 1}
                  </p>
                  <p style={{ color: "#6b7280", marginBottom: "16px", fontStyle: "italic" }}>
                    "{item.question}"
                  </p>

                  {/* ✅ USER'S ANSWER SECTION */}
                  <div
                    style={{
                      padding: "16px",
                      background: "#ffffff",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      marginBottom: "16px"
                    }}
                  >
                    <p style={{ fontWeight: "600", color: "#374151", marginBottom: "8px", fontSize: "14px" }}>
                      📝 Your Answer:
                    </p>
                    <p
                      style={{
                        color: "#4b5563",
                        lineHeight: "1.6",
                        whiteSpace: "pre-wrap",
                        fontFamily: "monospace",
                        fontSize: "14px",
                        background: "#f9fafb",
                        padding: "12px",
                        borderRadius: "6px",
                        maxHeight: "200px",
                        overflowY: "auto"
                      }}
                    >
                      {userAnswer}
                    </p>
                    <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>
                      {userAnswer.length} characters
                    </p>
                  </div>

                  {/* Quality Badges */}
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginBottom: "16px",
                      flexWrap: "wrap"
                    }}
                  >
                    <span
                      style={{
                        padding: "6px 14px",
                        background: qualityStyle.bg,
                        color: qualityStyle.color,
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: "600"
                      }}
                    >
                      Quality: {item.answerQuality}
                    </span>
                    <span
                      style={{
                        padding: "6px 14px",
                        background: "#e0f2fe",
                        color: "#0c4a6e",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: "600"
                      }}
                    >
                      Relevance: {item.relevance}
                    </span>
                    <span
                      style={{
                        padding: "6px 14px",
                        background: clarityStyle.bg,
                        color: clarityStyle.color,
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: "600"
                      }}
                    >
                      Clarity: {item.toneAndClarity}
                    </span>
                  </div>

                  {/* Feedback */}
                  <div
                    style={{
                      padding: "16px",
                      background: "#eff6ff",
                      borderLeft: "4px solid #3b82f6",
                      borderRadius: "8px",
                      marginBottom: "12px"
                    }}
                  >
                    <p style={{ fontWeight: "600", color: "#1e40af", marginBottom: "8px" }}>
                      📝 Feedback
                    </p>
                    <p style={{ color: "#374151", lineHeight: "1.6" }}>
                      {item.feedback}
                    </p>
                  </div>

                  {/* Improvement Suggestion */}
                  <div
                    style={{
                      padding: "16px",
                      background: "#f0fdf4",
                      borderLeft: "4px solid #10b981",
                      borderRadius: "8px"
                    }}
                  >
                    <p style={{ fontWeight: "600", color: "#065f46", marginBottom: "8px" }}>
                      💡 How to Improve
                    </p>
                    <p style={{ color: "#374151", lineHeight: "1.6" }}>
                      {item.improvementSuggestion}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Final Suggestions */}
        {finalSuggestions && (
          <div
            style={{
              padding: "24px",
              background: "#fffbeb",
              borderLeft: "4px solid #f59e0b",
              borderRadius: "12px",
              marginBottom: "32px"
            }}
          >
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#92400e", marginBottom: "12px" }}>
              🎯 Overall Improvement Tips
            </h2>
            <p style={{ color: "#374151", lineHeight: "1.8", whiteSpace: "pre-line" }}>
              {finalSuggestions}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/student/mock-interviews")}
            style={{
              flex: "1",
              minWidth: "200px",
              padding: "14px 24px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "0.2s"
            }}
            onMouseEnter={(e) => (e.target.style.background = "#2563eb")}
            onMouseLeave={(e) => (e.target.style.background = "#3b82f6")}
          >
            Try Another Interview
          </button>
          <button
            onClick={() => window.print()}
            style={{
              flex: "1",
              minWidth: "200px",
              padding: "14px 24px",
              background: "#6b7280",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "0.2s"
            }}
            onMouseEnter={(e) => (e.target.style.background = "#4b5563")}
            onMouseLeave={(e) => (e.target.style.background = "#6b7280")}
          >
            🖨️ Print Results
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          nav { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default MockInterviewResult;