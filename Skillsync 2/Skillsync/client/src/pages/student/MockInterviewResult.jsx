// client/src/pages/student/MockInterviewResult.jsx
import { useLocation, useNavigate } from "react-router-dom";
import "./MockInterviews.css";

function MockInterviewResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    type,
    difficulty,
    questions,
    answers,
    score,
    overallFeedback,
    questionWiseAnalysis,
    finalSuggestions
  } = location.state || {};

  if (!score && score !== 0) {
    return (
      <div className="mock-interviews-container">
        <div className="error-message">
          <p>❌ No result data found. Please complete an interview first.</p>
          <button onClick={() => navigate("/student/mock-interviews")}>
            Go to Mock Interviews
          </button>
        </div>
      </div>
    );
  }

  const scorePercentage = (score / 50) * 100;
  const getScoreColor = () => {
    if (scorePercentage >= 80) return "#16a34a";
    if (scorePercentage >= 60) return "#eab308";
    return "#dc2626";
  };

  const getQualityColor = (quality) => {
    const colors = {
      Excellent: "#16a34a",
      Good: "#16a34a",
      Average: "#eab308",
      Poor: "#dc2626"
    };
    return colors[quality] || "#6b7280";
  };

  return (
    <div className="mock-interview-result">
      {/* Header */}
      <div className="result-header">
        <h1>📊 Interview Results</h1>
        <div className="result-meta">
          <span className="badge">{type.toUpperCase()}</span>
          <span className="badge" data-difficulty={difficulty}>
            {difficulty}
          </span>
        </div>
      </div>

      {/* Score Card */}
      <div className="score-card" style={{ borderColor: getScoreColor() }}>
        <div className="score-display">
          <div 
            className="score-circle" 
            style={{ 
              background: `conic-gradient(${getScoreColor()} ${scorePercentage}%, #e5e7eb ${scorePercentage}%)`
            }}
          >
            <div className="score-inner">
              <span className="score-number">{score}</span>
              <span className="score-total">/50</span>
            </div>
          </div>
          <div className="score-info">
            <h3>Your Score</h3>
            <p className="score-percentage">{scorePercentage.toFixed(0)}%</p>
            <p className="score-label">
              {scorePercentage >= 80 ? "Excellent! 🎉" : 
               scorePercentage >= 60 ? "Good Job! 👍" : 
               "Keep Practicing! 💪"}
            </p>
          </div>
        </div>

        <div className="overall-feedback">
          <h4>Overall Feedback</h4>
          <p>{overallFeedback}</p>
        </div>
      </div>

      {/* Question-wise Analysis */}
      {questionWiseAnalysis && questionWiseAnalysis.length > 0 && (
        <div className="analysis-section">
          <h3>📝 Question-wise Analysis</h3>
          
          {questionWiseAnalysis.map((analysis, idx) => (
            <div key={idx} className="analysis-card">
              <div className="analysis-header">
                <span className="question-number">Q{idx + 1}</span>
                <span 
                  className="quality-badge"
                  style={{ 
                    background: getQualityColor(analysis.answerQuality),
                    color: "white"
                  }}
                >
                  {analysis.answerQuality}
                </span>
              </div>

              <div className="analysis-question">
                <strong>Question:</strong> {questions[idx]}
              </div>

              <div className="analysis-answer">
                <strong>Your Answer:</strong>
                <p>{answers[idx] || "No answer provided"}</p>
              </div>

              <div className="analysis-metrics">
                <div className="metric">
                  <span className="metric-label">Relevance:</span>
                  <span 
                    className="metric-value"
                    style={{ 
                      color: analysis.relevance === "Relevant" ? "#16a34a" : "#eab308"
                    }}
                  >
                    {analysis.relevance}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Clarity:</span>
                  <span 
                    className="metric-value"
                    style={{ color: getQualityColor(analysis.toneAndClarity) }}
                  >
                    {analysis.toneAndClarity}
                  </span>
                </div>
              </div>

              <div className="analysis-feedback">
                <strong>Feedback:</strong>
                <p>{analysis.feedback}</p>
              </div>

              <div className="analysis-suggestion">
                <strong>💡 Improvement Suggestion:</strong>
                <p>{analysis.improvementSuggestion}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Final Suggestions */}
      {finalSuggestions && (
        <div className="suggestions-card">
          <h3>🎯 Final Recommendations</h3>
          <p>{finalSuggestions}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="result-actions">
        <button 
          className="btn-secondary"
          onClick={() => navigate("/student/mock-interviews/history")}
        >
          📊 View History
        </button>
        <button 
          className="btn-primary"
          onClick={() => navigate("/student/mock-interviews")}
        >
          🔄 Try Another Interview
        </button>
      </div>
    </div>
  );
}

export default MockInterviewResult;