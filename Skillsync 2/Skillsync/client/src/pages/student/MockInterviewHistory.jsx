// client/src/pages/student/MockInterviewHistory.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mockInterviewService from "../../services/mockInterviewService";
import "./MockInterviews.css";

function MockInterviewHistory() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await mockInterviewService.getHistory();
      setAttempts(data.attempts || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError(err.error || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    const percentage = (score / 50) * 100;
    if (percentage >= 80) return "#16a34a";
    if (percentage >= 60) return "#eab308";
    return "#dc2626";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const viewAttemptDetails = async (attemptId) => {
    try {
      const details = await mockInterviewService.getAttemptDetails(attemptId);
      
      navigate("/student/mock-interviews/result", {
        state: {
          type: details.interview_type,
          difficulty: details.difficulty,
          questions: details.questions,
          answers: details.answers,
          score: details.score,
          overallFeedback: details.overall_feedback,
          questionWiseAnalysis: details.question_wise_analysis,
          finalSuggestions: details.final_suggestions
        }
      });
    } catch (err) {
      alert("Failed to load attempt details");
    }
  };

  if (loading) {
    return (
      <div className="mock-interviews-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your interview history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mock-interviews-container">
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={fetchHistory}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mock-interviews-container">
      <div className="mock-interviews-header">
        <button 
          className="btn-back"
          onClick={() => navigate("/student/mock-interviews")}
        >
          ← Back
        </button>
        <h1>📊 Your Interview History</h1>
        <p className="subtitle">
          Review your past interview attempts and track your progress
        </p>
      </div>

      {attempts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No Interview History Yet</h3>
          <p>Start practicing to see your interview attempts here</p>
          <button 
            className="btn-primary"
            onClick={() => navigate("/student/mock-interviews")}
          >
            Start Your First Interview
          </button>
        </div>
      ) : (
        <>
          <div className="history-stats">
            <div className="stat-card">
              <span className="stat-number">{attempts.length}</span>
              <span className="stat-label">Total Attempts</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length).toFixed(1)}
              </span>
              <span className="stat-label">Average Score</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {Math.max(...attempts.map(a => a.score))}
              </span>
              <span className="stat-label">Best Score</span>
            </div>
          </div>

          <div className="history-list">
            {attempts.map((attempt) => (
              <div key={attempt.attempt_id} className="history-card">
                <div className="history-header">
                  <div className="history-title">
                    <span className="badge">{attempt.interview_type.toUpperCase()}</span>
                    <span className="badge" data-difficulty={attempt.difficulty}>
                      {attempt.difficulty}
                    </span>
                  </div>
                  <div 
                    className="history-score"
                    style={{ color: getScoreColor(attempt.score) }}
                  >
                    {attempt.score}/50
                  </div>
                </div>

                <div className="history-date">
                  📅 {formatDate(attempt.created_at)}
                </div>

                {attempt.overall_feedback && (
                  <div className="history-feedback">
                    <strong>Feedback:</strong>
                    <p>{attempt.overall_feedback.substring(0, 150)}...</p>
                  </div>
                )}

                <button 
                  className="btn-view-details"
                  onClick={() => viewAttemptDetails(attempt.attempt_id)}
                >
                  View Full Details →
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default MockInterviewHistory;