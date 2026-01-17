// client/src/pages/student/MockInterviewSession.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import mockInterviewService from "../../services/mockInterviewService";
import "./MockInterviews.css";

function MockInterviewSession() {
  const location = useLocation();
  const navigate = useNavigate();

  const { type, difficulty, questions } = location.state || {};

  const [answers, setAnswers] = useState(Array(questions?.length || 0).fill(""));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!type || !difficulty || !questions || questions.length === 0) {
      navigate("/student/mock-interviews");
    }
  }, [type, difficulty, questions, navigate]);

  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = answers.filter(a => !a.trim()).length;
    
    if (unanswered > 0) {
      const confirm = window.confirm(
        `You have ${unanswered} unanswered question(s). Submit anyway?`
      );
      if (!confirm) return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Extract question texts
      const questionTexts = questions.map(q => q.question || q);

      // Submit answers
      const result = await mockInterviewService.submitAnswers(
        type,
        difficulty,
        questionTexts,
        answers
      );

      // Navigate to result page
      navigate("/student/mock-interviews/result", {
        state: {
          type,
          difficulty,
          questions: questionTexts,
          answers,
          ...result
        }
      });
    } catch (err) {
      console.error("Error submitting answers:", err);
      setError(err.error || "Failed to submit answers. Please try again.");
      setSubmitting(false);
    }
  };

  if (!questions || questions.length === 0) {
    return <div>Loading...</div>;
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  return (
    <div className="mock-interview-session">
      <div className="session-header">
        <button 
          className="btn-back"
          onClick={() => {
            const confirm = window.confirm("Are you sure? Your progress will be lost.");
            if (confirm) navigate("/student/mock-interviews");
          }}
        >
          ← Exit
        </button>
        <div className="session-info">
          <h2>{type.toUpperCase()} Interview</h2>
          <span className="difficulty-badge" data-difficulty={difficulty}>
            {difficulty}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        <span className="progress-text">
          Question {currentQuestion + 1} of {questions.length}
        </span>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Question Card */}
      <div className="question-container">
        <div className="question-number">Question {currentQuestion + 1}</div>
        <h3 className="question-text">
          {currentQ.question || currentQ}
        </h3>

        <textarea
          className="answer-input"
          placeholder="Type your answer here..."
          value={answers[currentQuestion]}
          onChange={(e) => handleAnswerChange(e.target.value)}
          rows={10}
          disabled={submitting}
        />

        <div className="character-count">
          {answers[currentQuestion].length} characters
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="session-actions">
        <button
          className="btn-secondary"
          onClick={handlePrevious}
          disabled={currentQuestion === 0 || submitting}
        >
          ← Previous
        </button>

        {currentQuestion < questions.length - 1 ? (
          <button
            className="btn-primary"
            onClick={handleNext}
            disabled={submitting}
          >
            Next →
          </button>
        ) : (
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Interview"}
          </button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="question-navigator">
        {questions.map((_, idx) => (
          <button
            key={idx}
            className={`nav-dot ${idx === currentQuestion ? "active" : ""} ${
              answers[idx].trim() ? "answered" : ""
            }`}
            onClick={() => setCurrentQuestion(idx)}
            disabled={submitting}
            title={`Question ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default MockInterviewSession;