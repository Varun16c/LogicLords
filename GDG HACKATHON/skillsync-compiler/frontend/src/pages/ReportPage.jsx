import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubmissionReport } from '../services/submissionApi';
import '../styles/report.css';

const ReportPage = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);
  const MAX_POLL_ATTEMPTS = 30;

  useEffect(() => {
    fetchReport();
    window.scrollTo(0, 0);
  }, [submissionId]);

  useEffect(() => {
    if (!analyzing || pollAttempts >= MAX_POLL_ATTEMPTS) return;

    const pollInterval = setInterval(() => {
      console.log(`🔄 Polling attempt ${pollAttempts + 1}/${MAX_POLL_ATTEMPTS}`);
      fetchReport();
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [analyzing, pollAttempts]);

  const fetchReport = async () => {
    try {
      const result = await getSubmissionReport(submissionId);
      console.log('Report data:', result);
      
      if (result && result.plagiarism_report && result.submission.total_score !== null) {
        setData(result);
        setLoading(false);
        setAnalyzing(false);
        console.log('✅ Report loaded successfully');
      } else {
        if (!analyzing) {
          console.log('⏳ Report not ready, starting analysis...');
          setAnalyzing(true);
        }
        setPollAttempts(prev => prev + 1);
        
        if (pollAttempts >= MAX_POLL_ATTEMPTS) {
          setError('Analysis is taking longer than expected. Please refresh the page.');
          setLoading(false);
          setAnalyzing(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
      
      if (error.response?.status === 404 && pollAttempts < MAX_POLL_ATTEMPTS) {
        if (!analyzing) {
          console.log('⏳ Report not found, will retry...');
          setAnalyzing(true);
        }
        setPollAttempts(prev => prev + 1);
      } else if (pollAttempts >= MAX_POLL_ATTEMPTS) {
        setError('Analysis timeout. Please refresh the page to try again.');
        setLoading(false);
        setAnalyzing(false);
      } else {
        setError(error.message);
        setLoading(false);
        setAnalyzing(false);
      }
    }
  };

  const retryAnalysis = () => {
    setError(null);
    setLoading(true);
    setAnalyzing(true);
    setPollAttempts(0);
    fetchReport();
  };

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined || isNaN(seconds)) {
      return '0s';
    }
    
    const numSeconds = Number(seconds);
    if (numSeconds < 0) return '0s';
    
    const hrs = Math.floor(numSeconds / 3600);
    const mins = Math.floor((numSeconds % 3600) / 60);
    const secs = Math.floor(numSeconds % 60);
    
    const parts = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0) parts.push(`${mins}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
  };

  const getScoreClass = (score) => {
    const numScore = Number(score) || 0;
    if (numScore < 30) return 'low';
    if (numScore < 60) return 'medium';
    return 'high';
  };

  const getGradeFromPercentage = (percentage) => {
    const pct = Number(percentage) || 0;
    if (pct >= 90) return { grade: 'A+', color: '#10b981' };
    if (pct >= 80) return { grade: 'A', color: '#34d399' };
    if (pct >= 70) return { grade: 'B+', color: '#fbbf24' };
    if (pct >= 60) return { grade: 'B', color: '#fb923c' };
    if (pct >= 50) return { grade: 'C', color: '#f97316' };
    if (pct >= 40) return { grade: 'D', color: '#ef4444' };
    return { grade: 'F', color: '#dc2626' };
  };

  if (loading || analyzing) {
    return (
      <div className="report-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading">
          <div className="spinner"></div>
          <p>Analyzing submission...</p>
          {analyzing && (
            <div style={{ marginTop: '10px', fontSize: '0.9em', opacity: 0.7 }}>
              <p>🔍 Running pattern analysis...</p>
              <p>🤖 Running ChatGPT detection...</p>
              <p>👥 Comparing with other submissions...</p>
              <p>🧪 Executing test cases...</p>
              <p>⭐ Evaluating code quality...</p>
              <p style={{ marginTop: '10px' }}>
                Attempt {pollAttempts}/{MAX_POLL_ATTEMPTS}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="error">
          <h2>⚠️ Error Loading Report</h2>
          <p>{error}</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
            <button onClick={retryAnalysis}>
              🔄 Retry Analysis
            </button>
            <button onClick={() => navigate('/student/dashboard')}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.submission) {
    return (
      <div className="report-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="error">
          <h2>Report not found</h2>
          <button onClick={() => navigate('/student/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { submission, plagiarism_report } = data;
  const timeTaken = formatTime(submission.time_taken_seconds);
  
  const plagiarismScore = Number(plagiarism_report?.overall_similarity_score ?? 0);
  const aiScore = Number(plagiarism_report?.ai_detection_score ?? 0);

  let overallPercentage = 0;
  let gradeInfo = { grade: 'N/A', color: '#6b7280' };
  
  if (submission.total_score !== null && submission.score_breakdown) {
    const totalScore = Number(submission.total_score) || 0;
    const maxMarks = Number(submission.score_breakdown.maxMarks) || 1;
    overallPercentage = (totalScore / maxMarks) * 100;
    gradeInfo = getGradeFromPercentage(overallPercentage);
  }

  return (
    <div className="report-container">
      <div className="report-header">
        <h1>📊 Submission Analysis</h1>
        <button onClick={() => navigate('/student/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="report-grid">
        {/* Summary Card */}
        <div className="report-card summary-card">
          <h2>📋 Submission Details</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Exam</span>
              <span className="summary-value">{submission.exam_title || 'N/A'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Student</span>
              <span className="summary-value">{submission.student_name || 'N/A'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Duration</span>
              <span className="summary-value">{timeTaken}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Tab Switches</span>
              <span className={`summary-value ${(submission.tab_switch_count || 0) > 3 ? 'warning' : 'success'}`}>
                {submission.tab_switch_count || 0}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Submission Type</span>
              <span className="summary-value">
                {submission.is_auto_submitted ? '🤖 Auto' : '✋ Manual'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Submitted At</span>
              <span className="summary-value">{new Date(submission.submit_time).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* FINAL SCORE CARD */}
        {submission.total_score !== null && submission.score_breakdown && (
          <div className="report-card final-score-card">
            <h2>🎯 Final Score</h2>
            <div className="final-score-display">
              <div className="score-circle-large" style={{ '--score-color': gradeInfo.color }}>
                <svg viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="90" className="score-bg"></circle>
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="90" 
                    className="score-progress"
                    style={{
                      strokeDasharray: `${(overallPercentage / 100) * 565.48} 565.48`,
                      stroke: gradeInfo.color
                    }}
                  ></circle>
                </svg>
                <div className="score-content">
                  <div className="grade-badge" style={{ color: gradeInfo.color }}>
                    {gradeInfo.grade}
                  </div>
                  <div className="score-numbers">
                    <span className="score-earned">{Number(submission.total_score).toFixed(2)}</span>
                    <span className="score-divider">/</span>
                    <span className="score-max">{submission.score_breakdown.maxMarks}</span>
                  </div>
                  <div className="score-percentage">
                    {overallPercentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Detection Score */}
        <div className="report-card score-card">
          <h2>🤖 AI Detection</h2>
          {!plagiarism_report ? (
            <div className="analysis-pending">
              <div className="pending-spinner"></div>
              <p>Analyzing...</p>
            </div>
          ) : (
            <div className="score-display">
              <div className={`score-circle ${getScoreClass(aiScore)}`}>
                <svg viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="90" className="score-bg"></circle>
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="90" 
                    className="score-progress"
                    style={{
                      strokeDasharray: `${(aiScore / 100) * 565.48} 565.48`
                    }}
                  ></circle>
                </svg>
                <div className="score-text">
                  <span className="score-number">{aiScore.toFixed(1)}</span>
                  <span className="score-symbol">%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Plagiarism Score */}
        <div className="report-card score-card">
          <h2>👥 Plagiarism Detection</h2>
          {!plagiarism_report ? (
            <div className="analysis-pending">
              <div className="pending-spinner"></div>
              <p>Analyzing...</p>
            </div>
          ) : (
            <div className="score-display">
              <div className={`score-circle ${getScoreClass(plagiarismScore)}`}>
                <svg viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="90" className="score-bg"></circle>
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="90" 
                    className="score-progress"
                    style={{
                      strokeDasharray: `${(plagiarismScore / 100) * 565.48} 565.48`
                    }}
                  ></circle>
                </svg>
                <div className="score-text">
                  <span className="score-number">{plagiarismScore.toFixed(1)}</span>
                  <span className="score-symbol">%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SCORE BREAKDOWN CARD - UPDATED WITH BONUS SYSTEM */}
        {submission.total_score !== null && submission.score_breakdown && (
          <div className="report-card score-breakdown-card full-width">
            <h2>📊 Detailed Score Breakdown</h2>

            <div className="breakdown-grid">
              {/* Test Cases */}
              <div className="breakdown-item positive">
                <div className="breakdown-header">
                  <span className="breakdown-icon">✅</span>
                  <span className="breakdown-title">Test Cases</span>
                </div>
                <div className="breakdown-score">
                  {Number(submission.score_breakdown.testCaseScore).toFixed(2)} <span className="breakdown-max">/ {submission.score_breakdown.testCaseMaxMarks}</span>
                </div>
                <div className="breakdown-detail">
                  Passed: {submission.score_breakdown.testCasesPassed}/{submission.score_breakdown.testCasesTotal} 
                  ({Number(submission.score_breakdown.testCasePassPercentage).toFixed(1)}%)
                </div>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-bar-fill positive-fill" 
                    style={{ width: `${submission.score_breakdown.testCasePassPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Code Logic */}
              <div className="breakdown-item positive">
                <div className="breakdown-header">
                  <span className="breakdown-icon">🧠</span>
                  <span className="breakdown-title">Code Logic</span>
                </div>
                <div className="breakdown-score">
                  {Number(submission.score_breakdown.codeLogicScore).toFixed(2)} <span className="breakdown-max">/ {submission.score_breakdown.codeLogicMaxMarks}</span>
                </div>
                <div className="breakdown-detail">
                  AI Logic Score: {Number(submission.score_breakdown.codeLogicPercentage).toFixed(1)}%
                </div>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-bar-fill positive-fill" 
                    style={{ width: `${submission.score_breakdown.codeLogicPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Code Quality */}
              <div className="breakdown-item positive">
                <div className="breakdown-header">
                  <span className="breakdown-icon">⭐</span>
                  <span className="breakdown-title">Code Quality</span>
                </div>
                <div className="breakdown-score">
                  {Number(submission.score_breakdown.codeQualityScore).toFixed(2)} <span className="breakdown-max">/ {submission.score_breakdown.codeQualityMaxMarks}</span>
                </div>
                <div className="breakdown-detail">
                  AI Quality Score: {Number(submission.score_breakdown.codeQualityPercentage).toFixed(1)}%
                </div>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-bar-fill positive-fill" 
                    style={{ width: `${submission.score_breakdown.codeQualityPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Plagiarism Bonus/Penalty */}
              <div className="breakdown-item negative">
                <div className="breakdown-header">
                  <span className="breakdown-icon">👥</span>
                  <span className="breakdown-title">Plagiarism Penalty</span>
                </div>
                <div className="breakdown-score deduction">
                  -{Number(submission.score_breakdown.plagiarismDeduction).toFixed(2)}
                </div>
                <div className="breakdown-detail">
                  Similarity: {Number(submission.score_breakdown.plagiarismPercentage).toFixed(1)}%
                  <br />
                  Max Penalty: {submission.score_breakdown.plagiarismMaxPenalty}
                </div>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-bar-fill negative-fill" 
                    style={{ width: `${submission.score_breakdown.plagiarismPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* AI Detection Bonus/Penalty */}
              <div className="breakdown-item negative">
                <div className="breakdown-header">
                  <span className="breakdown-icon">🤖</span>
                  <span className="breakdown-title">AI Detection Penalty</span>
                </div>
                <div className="breakdown-score deduction">
                  -{Number(submission.score_breakdown.aiDeduction).toFixed(2)}
                </div>
                <div className="breakdown-detail">
                  AI Score: {Number(submission.score_breakdown.aiDetectionPercentage).toFixed(1)}%
                  <br />
                  Max Penalty: {submission.score_breakdown.aiMaxPenalty}
                </div>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-bar-fill negative-fill" 
                    style={{ width: `${submission.score_breakdown.aiDetectionPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Tab Switch Bonus/Penalty */}
              <div className="breakdown-item negative">
                <div className="breakdown-header">
                  <span className="breakdown-icon">🔄</span>
                  <span className="breakdown-title">Tab Switch Penalty</span>
                </div>
                <div className="breakdown-score deduction">
                  -{Number(submission.score_breakdown.tabSwitchDeduction).toFixed(2)}
                </div>
                <div className="breakdown-detail">
                  Switches: {submission.score_breakdown.tabSwitchCount}
                  <br />
                  Max Penalty: {submission.score_breakdown.tabSwitchMaxPenalty}
                </div>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-bar-fill negative-fill" 
                    style={{ width: `${submission.score_breakdown.tabSwitchPenaltyPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* UPDATED: Total Summary with Bonus System */}
            <div className="deductions-summary">
              <div className="deductions-row">
                <span className="deductions-label">Performance Score:</span>
                <span className="deductions-value positive">
                  +{(submission.score_breakdown.performanceScore || 
                     (Number(submission.score_breakdown.testCaseScore) + 
                      Number(submission.score_breakdown.codeLogicScore) + 
                      Number(submission.score_breakdown.codeQualityScore))).toFixed(2)}
                </span>
              </div>
              
              {/* Show bonus breakdown if available */}
              {submission.score_breakdown.totalBonus !== undefined && (
                <>
                  <div className="deductions-row bonus-section">
                    <span className="deductions-label">🎁 Integrity Bonus:</span>
                    <span className="deductions-value positive" style={{ color: '#10b981' }}>
                      +{Number(submission.score_breakdown.totalBonus).toFixed(2)}
                    </span>
                  </div>
                  <div className="bonus-breakdown" style={{ paddingLeft: '20px', fontSize: '0.9em', opacity: 0.8 }}>
                    <div className="deductions-row" style={{ marginBottom: '4px' }}>
                      <span className="deductions-label">├─ No Plagiarism Bonus:</span>
                      <span className="deductions-value positive">
                        +{Number(submission.score_breakdown.plagiarismBonus || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="deductions-row" style={{ marginBottom: '4px' }}>
                      <span className="deductions-label">├─ No AI Detection Bonus:</span>
                      <span className="deductions-value positive">
                        +{Number(submission.score_breakdown.aiBonus || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="deductions-row" style={{ marginBottom: '8px' }}>
                      <span className="deductions-label">└─ No Tab Switch Bonus:</span>
                      <span className="deductions-value positive">
                        +{Number(submission.score_breakdown.tabSwitchBonus || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              )}
              
              <div className="deductions-row final-total">
                <span className="deductions-label">Final Score:</span>
                <span className="deductions-value" style={{ color: gradeInfo.color }}>
                  {Number(submission.total_score).toFixed(2)} / {submission.score_breakdown.maxMarks}
                </span>
              </div>
            </div>

            {/* AI Reasoning */}
            {submission.score_breakdown.aiReasoning && (
              <div className="ai-reasoning">
                <h4>🤖 AI Evaluation Feedback</h4>
                <p>{submission.score_breakdown.aiReasoning}</p>
              </div>
            )}
          </div>
        )}

        {/* Test Results Details */}
        {submission.test_results && submission.test_results.results && (
          <div className="report-card test-results-card full-width">
            <h2>🧪 Test Case Results</h2>
            <div className="test-results-summary">
              <div className="test-summary-item">
                <span className="test-summary-icon">✅</span>
                <span className="test-summary-value">{submission.test_results.passedCount}</span>
                <span className="test-summary-label">Passed</span>
              </div>
              <div className="test-summary-item">
                <span className="test-summary-icon">❌</span>
                <span className="test-summary-value">
                  {submission.test_results.totalCount - submission.test_results.passedCount}
                </span>
                <span className="test-summary-label">Failed</span>
              </div>
              <div className="test-summary-item">
                <span className="test-summary-icon">📊</span>
                <span className="test-summary-value">
                  {Number(submission.test_results.passPercentage).toFixed(1)}%
                </span>
                <span className="test-summary-label">Pass Rate</span>
              </div>
            </div>

            <div className="test-results-list">
              {submission.test_results.results.map((test, idx) => (
                <div key={idx} className={`test-result ${test.passed ? 'passed' : 'failed'}`}>
                  <div className="test-header">
                    <span className="test-case-number">Test Case {test.test_case}</span>
                    <span className={test.passed ? 'badge-success' : 'badge-error'}>
                      {test.passed ? '✅ Passed' : '❌ Failed'}
                    </span>
                  </div>
                  <div className="test-details">
                    <div className="test-detail-row">
                      <strong>Input:</strong>
                      <code>{test.input || 'No input'}</code>
                    </div>
                    <div className="test-detail-row">
                      <strong>Expected Output:</strong>
                      <code className="expected">{test.expected}</code>
                    </div>
                    <div className="test-detail-row">
                      <strong>Your Output:</strong>
                      <code className={test.passed ? 'actual-correct' : 'actual-wrong'}>
                        {test.error || test.actual || 'No output'}
                      </code>
                    </div>
                    {test.error && (
                      <div className="test-error">
                        <strong>Error:</strong> {test.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Switch Timeline */}
        {submission.tab_switches && Array.isArray(submission.tab_switches) && submission.tab_switches.length > 0 && (
          <div className="report-card timeline-card full-width">
            <h2>📊 Activity Timeline</h2>
            <div className="timeline-stats">
              <span className="timeline-count">{submission.tab_switches.length} events recorded</span>
            </div>
            <div className="timeline">
              {submission.tab_switches.slice(0, 10).map((event, idx) => (
                <div key={idx} className={`timeline-event ${event.event_type}`}>
                  <div className="event-indicator"></div>
                  <div className="event-details">
                    <span className="event-time">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="event-type">
                      {event.event_type === 'blur' ? 'Left window' : 'Returned'}
                    </span>
                  </div>
                </div>
              ))}
              {submission.tab_switches.length > 10 && (
                <div className="timeline-more">
                  +{submission.tab_switches.length - 10} more events
                </div>
              )}
            </div>
          </div>
        )}

        {/* Question */}
        <div className="report-card code-card full-width">
          <h2>❓ Question</h2>
          <pre className="code-block">{submission.question || 'N/A'}</pre>
        </div>

        {/* Your Solution */}
        <div className="report-card code-card full-width">
          <div className="code-header">
            <h2>💻 Your Solution</h2>
            <span className="language-badge">{submission.language || 'N/A'}</span>
          </div>
          <pre className="code-block">{submission.code || 'No code submitted'}</pre>
        </div>

        {/* Expected Solution */}
        {submission.solution && (
          <div className="report-card code-card full-width">
            <h2>✅ Expected Solution</h2>
            <pre className="code-block">{submission.solution}</pre>
          </div>
        )}

        {/* AI Detection Reasons */}
        {plagiarism_report && plagiarism_report.ai_detection_reasons && plagiarism_report.ai_detection_reasons.length > 0 && (
          <div className="report-card ai-reasons-card full-width">
            <h2>🔍 AI Detection Indicators</h2>
            <ul className="ai-reasons-list">
              {plagiarism_report.ai_detection_reasons.map((reason, idx) => (
                <li key={idx} className="ai-reason-item">
                  <span className="reason-icon">•</span>
                  <span className="reason-text">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Plagiarism Matches */}
        {plagiarism_report && plagiarism_report.matches && plagiarism_report.matches.length > 0 && (
          <div className="report-card plagiarism-matches-card full-width">
            <h2>👥 Similar Submissions Found</h2>
            <div className="matches-list">
              {plagiarism_report.matches.slice(0, 5).map((match, idx) => (
                <div key={idx} className="match-item">
                  <div className="match-header">
                    <span className="match-student">{match.student_name}</span>
                    <span className={`match-score ${getScoreClass(match.similarity_score)}`}>
                      {Number(match.similarity_score).toFixed(1)}% similar
                    </span>
                  </div>
                  <div className="match-details">
                    <span className="match-detail">Language: {match.language}</span>
                    <span className="match-detail">
                      Submitted: {new Date(match.submit_time).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              {plagiarism_report.matches.length > 5 && (
                <div className="matches-more">
                  +{plagiarism_report.matches.length - 5} more matches
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;