// client/src/pages/student/MockInterviews.jsx
import { useNavigate } from "react-router-dom";
import "./MockInterviews.css";

const interviewTypes = [
  {
    id: "hr",
    title: "HR Interview",
    icon: "💼",
    description: "Behavioral and situational questions to assess soft skills and cultural fit",
    color: "#4f46e5"
  },
  {
    id: "technical",
    title: "Technical Interview",
    icon: "💻",
    description: "DSA, DBMS, OS, OOPS concepts and technical problem-solving",
    color: "#16a34a"
  },
  {
    id: "coding",
    title: "Coding Interview",
    icon: "⚡",
    description: "Real-world coding problems and algorithmic challenges",
    color: "#dc2626"
  }
];

function MockInterviews() {
  const navigate = useNavigate();

  const handleSelectType = (type) => {
    navigate(`/student/mock-interviews/${type}`);
  };

  return (
    <div className="mock-interviews-container">
      <div className="mock-interviews-header">
        <h1>🎯 Mock Interview Practice</h1>
        <p className="subtitle">
          Prepare for your interviews with AI-powered mock sessions
        </p>
      </div>

      <div className="interview-types-grid">
        {interviewTypes.map((type) => (
          <div
            key={type.id}
            className="interview-type-card"
            onClick={() => handleSelectType(type.id)}
            style={{ borderColor: type.color }}
          >
            <div className="card-icon" style={{ background: type.color }}>
              {type.icon}
            </div>
            <h3 className="card-title">{type.title}</h3>
            <p className="card-description">{type.description}</p>
            <button 
              className="card-button"
              style={{ background: type.color }}
            >
              Start Practice →
            </button>
          </div>
        ))}
      </div>

      <div className="info-section">
        <h3>📌 How It Works</h3>
        <div className="info-steps">
          <div className="info-step">
            <span className="step-number">1</span>
            <p>Choose interview type and difficulty level</p>
          </div>
          <div className="info-step">
            <span className="step-number">2</span>
            <p>Get 5 AI-generated questions tailored to your selection</p>
          </div>
          <div className="info-step">
            <span className="step-number">3</span>
            <p>Answer the questions and receive detailed feedback</p>
          </div>
          <div className="info-step">
            <span className="step-number">4</span>
            <p>Review your score and improvement suggestions</p>
          </div>
        </div>
      </div>

      <div className="history-link">
        <button 
          className="btn-secondary"
          onClick={() => navigate("/student/mock-interviews/history")}
        >
          📊 View Your Interview History
        </button>
      </div>
    </div>
  );
}

export default MockInterviews;