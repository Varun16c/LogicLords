// client/src/pages/student/MockInterviewLevels.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import mockInterviewService from "../../services/mockInterviewService";
import "./MockInterviews.css";

const difficultyLevels = [
  {
    id: "easy",
    title: "Easy",
    icon: "🟢",
    description: "Perfect for beginners and first-time interviewees",
    color: "#16a34a"
  },
  {
    id: "medium",
    title: "Medium",
    icon: "🟡",
    description: "Intermediate level for students with some experience",
    color: "#eab308"
  },
  {
    id: "hard",
    title: "Hard",
    icon: "🔴",
    description: "Advanced questions for experienced candidates",
    color: "#dc2626"
  }
];

const typeLabels = {
  hr: "HR Interview",
  technical: "Technical Interview",
  coding: "Coding Interview"
};

function MockInterviewLevels() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelectDifficulty = async (difficulty) => {
    setLoading(true);
    setError(null);

    try {
      // Generate questions
      const data = await mockInterviewService.generateQuestions(type, difficulty);

      // Navigate to session with questions
      navigate("/student/mock-interviews/session", {
        state: {
          type,
          difficulty,
          questions: data.questions
        }
      });
    } catch (err) {
      console.error("Error generating questions:", err);
      setError(err.error || "Failed to generate questions. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mock-interviews-container">
      <div className="mock-interviews-header">
        <button 
          className="btn-back"
          onClick={() => navigate("/student/mock-interviews")}
        >
          ← Back
        </button>
        <h1>Select Difficulty Level</h1>
        <p className="subtitle">
          {typeLabels[type] || type.toUpperCase()}
        </p>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Generating your interview questions...</p>
        </div>
      ) : (
        <div className="difficulty-levels-grid">
          {difficultyLevels.map((level) => (
            <div
              key={level.id}
              className="difficulty-card"
              onClick={() => handleSelectDifficulty(level.id)}
              style={{ borderColor: level.color }}
            >
              <div className="card-icon" style={{ background: level.color }}>
                {level.icon}
              </div>
              <h3 className="card-title">{level.title}</h3>
              <p className="card-description">{level.description}</p>
              <button 
                className="card-button"
                style={{ background: level.color }}
              >
                Select {level.title} →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MockInterviewLevels;