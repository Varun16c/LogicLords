import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function MockInterviewSession() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { type, difficulty, questions } = state || {};

  const [answers, setAnswers] = useState(
    questions ? new Array(questions.length).fill("") : []
  );

  const [submitting, setSubmitting] = useState(false);

  // ✅ Better validation
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ color: "#ef4444", marginBottom: "16px" }}>
          No questions found
        </h2>
        <button
          onClick={() => navigate("/student/mock-interviews")}
          style={{
            padding: "12px 24px",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Back to Mock Interviews
        </button>
      </div>
    );
  }

  const handleChange = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");
      console.log("🔑 TOKEN:", token ? "EXISTS" : "MISSING");

      if (!token) {
        alert("Please login again");
        navigate("/login");
        return;
      }

      // ✅ Extract question text properly
      const questionTexts = questions.map(q => {
        if (typeof q === 'string') return q;
        if (q.question) return q.question;
        return JSON.stringify(q);
      });

      console.log("📤 SENDING TO BACKEND:", {
        type,
        difficulty,
        questions: questionTexts,
        answers
      });

      const res = await fetch(
        "http://localhost:5000/api/mock-interviews/submit-answers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            type,
            difficulty,
            questions: questionTexts,
            answers
          })
        }
      );

      console.log("📡 RESPONSE STATUS:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ ERROR:", errorData);
        alert(`Error: ${errorData.error || "Failed to submit"}`);
        return;
      }

      const evaluation = await res.json();
      console.log("📊 EVALUATION RECEIVED:", evaluation);
      console.log("📝 ANSWERS BEING SENT:", answers);

      // ✅ CRITICAL FIX: Pass both questions and answers to result page
      navigate("/student/mock-interview/result", {
        state: {
          type,
          difficulty,
          evaluation,
          questions: questionTexts, // ✅ Pass the questions
          answers: answers // ✅ Pass the user's answers
        }
      });
    } catch (error) {
      console.error("Submit failed:", error);
      alert("Failed to submit answers. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "40px", background: "#f9fafb", minHeight: "100vh" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "32px",
          maxWidth: "900px",
          margin: "0 auto",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>
          {type.toUpperCase()} Interview
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "32px" }}>
          Difficulty: <strong style={{ textTransform: "capitalize" }}>{difficulty}</strong>
        </p>

        {questions.map((q, i) => {
          const questionText = typeof q === 'string' ? q : (q.question || JSON.stringify(q));

          return (
            <div
              key={i}
              style={{
                marginBottom: "32px",
                padding: "20px",
                background: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb"
              }}
            >
              <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>
                <strong>Q{i + 1}:</strong> {questionText}
              </p>
              <textarea
                rows="5"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  resize: "vertical"
                }}
                placeholder="Type your answer here..."
                value={answers[i]}
                onChange={(e) => handleChange(i, e.target.value)}
              />
              <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>
                {answers[i].length} characters
              </p>
            </div>
          );
        })}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "16px",
            fontWeight: "600",
            background: submitting ? "#9ca3af" : "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: submitting ? "not-allowed" : "pointer",
            transition: "0.2s"
          }}
        >
          {submitting ? "Submitting..." : "Submit Answers"}
        </button>
      </div>
    </div>
  );
}

export default MockInterviewSession;