import { useLocation, useNavigate } from "react-router-dom";

function ResumeAnalysisResult() {
  const { state } = useLocation();
  const navigate = useNavigate();

  console.log("📋 STATE RECEIVED:", state);

  if (!state || !state.analysis) {
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
            No Analysis Data Found
          </h2>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>
            Please upload a resume first to see analysis results.
          </p>
          <button
            onClick={() => navigate("/student/resume-analyzer/upload")}
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
            Upload Resume
          </button>
        </div>
      </div>
    );
  }

  const { fileName, analysis } = state;
  const {
    atsScore,
    strengths,
    suggestions,
    sections,
    keywords,
    formatting,
    improvements,
    recommendedJobRoles,
    skillsGapAnalysis,
    missingCertifications,
    careerPathSuggestions
  } = analysis;

  // Helper function for score color
  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    if (score >= 40) return "#ef4444";
    return "#991b1b";
  };

  // Helper function for circular progress
  const CircularProgress = ({ score, label }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div style={{ textAlign: "center" }}>
        <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="70" cy="70" r={radius} stroke="#e5e7eb" strokeWidth="10" fill="none" />
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke={getScoreColor(score)}
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
          <text
            x="70"
            y="70"
            textAnchor="middle"
            dy="7"
            fontSize="28"
            fontWeight="700"
            fill={getScoreColor(score)}
            style={{ transform: "rotate(90deg)", transformOrigin: "70px 70px" }}
          >
            {score}
          </text>
        </svg>
        <p style={{ marginTop: "8px", fontWeight: "600", color: "#374151" }}>
          {label}
        </p>
      </div>
    );
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
            Resume Analysis Report
          </h1>
          <p style={{ color: "#6b7280", fontSize: "16px" }}>
            📄 {fileName}
          </p>
        </div>

        {/* Score Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "24px",
            marginBottom: "40px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress score={atsScore} label="ATS Score" />
          </div>
          {formatting && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress score={formatting.score} label="Formatting" />
            </div>
          )}
        </div>

        {/* Strengths */}
        {strengths && strengths.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px" }}>
              ✅ Strengths
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {strengths.map((strength, index) => (
                <div
                  key={index}
                  style={{
                    padding: "16px",
                    background: "#f0fdf4",
                    borderLeft: "4px solid #10b981",
                    borderRadius: "8px"
                  }}
                >
                  <p style={{ color: "#065f46", lineHeight: "1.6" }}>{strength}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvements with Priority */}
        {improvements && improvements.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px" }}>
              🎯 Detailed Improvements
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {improvements.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: "20px",
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                      {item.category}
                    </h3>
                    <span
                      style={{
                        padding: "4px 12px",
                        background: item.priority === "High" ? "#fee2e2" : item.priority === "Medium" ? "#fef3c7" : "#f0fdf4",
                        color: item.priority === "High" ? "#991b1b" : item.priority === "Medium" ? "#92400e" : "#065f46",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}
                    >
                      {item.priority} Priority
                    </span>
                  </div>
                  <p style={{ color: "#ef4444", fontSize: "14px", marginBottom: "8px" }}>
                    <strong>Issue:</strong> {item.issue}
                  </p>
                  <p style={{ color: "#10b981", fontSize: "14px" }}>
                    <strong>Suggestion:</strong> {item.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Job Roles */}
        {recommendedJobRoles && recommendedJobRoles.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px" }}>
              💼 Recommended Job Roles
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
              {recommendedJobRoles.map((role, index) => (
                <div
                  key={index}
                  style={{
                    padding: "20px",
                    background: "#eff6ff",
                    border: "2px solid #3b82f6",
                    borderRadius: "12px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1e40af" }}>
                      {role.title}
                    </h3>
                    <div style={{
                      background: "#3b82f6",
                      color: "#fff",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "14px",
                      fontWeight: "700"
                    }}>
                      {role.matchScore}%
                    </div>
                  </div>
                  <p style={{ color: "#1e40af", fontSize: "14px", lineHeight: "1.6" }}>
                    {role.reasoning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Gap Analysis */}
        {skillsGapAnalysis && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px" }}>
              📈 Skills Gap Analysis
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              {/* Current Skills */}
              {skillsGapAnalysis.currentSkills && skillsGapAnalysis.currentSkills.length > 0 && (
                <div style={{ padding: "20px", background: "#f0fdf4", borderRadius: "8px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#065f46", marginBottom: "12px" }}>
                    ✓ Current Skills
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {skillsGapAnalysis.currentSkills.map((skill, index) => (
                      <span
                        key={index}
                        style={{
                          padding: "6px 12px",
                          background: "#dcfce7",
                          color: "#166534",
                          borderRadius: "16px",
                          fontSize: "13px",
                          fontWeight: "500"
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Skills */}
              {skillsGapAnalysis.trendingSkills && skillsGapAnalysis.trendingSkills.length > 0 && (
                <div style={{ padding: "20px", background: "#fef3c7", borderRadius: "8px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#92400e", marginBottom: "12px" }}>
                    🔥 Trending Skills (Missing)
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {skillsGapAnalysis.trendingSkills.map((skill, index) => (
                      <span
                        key={index}
                        style={{
                          padding: "6px 12px",
                          background: "#fde68a",
                          color: "#78350f",
                          borderRadius: "16px",
                          fontSize: "13px",
                          fontWeight: "500"
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended to Learn */}
              {skillsGapAnalysis.recommendedToLearn && skillsGapAnalysis.recommendedToLearn.length > 0 && (
                <div style={{ padding: "20px", background: "#eff6ff", borderRadius: "8px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1e40af", marginBottom: "12px" }}>
                    🎓 Priority Learning
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {skillsGapAnalysis.recommendedToLearn.map((skill, index) => (
                      <span
                        key={index}
                        style={{
                          padding: "6px 12px",
                          background: "#dbeafe",
                          color: "#1e3a8a",
                          borderRadius: "16px",
                          fontSize: "13px",
                          fontWeight: "500"
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Missing Certifications */}
        {missingCertifications && missingCertifications.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px" }}>
              🎓 Recommended Certifications
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {missingCertifications.map((cert, index) => (
                <div
                  key={index}
                  style={{
                    padding: "16px",
                    background: "#f5f3ff",
                    border: "1px solid #8b5cf6",
                    borderRadius: "8px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#6b21a8" }}>
                      {cert.name}
                    </h3>
                    <span
                      style={{
                        padding: "4px 12px",
                        background: cert.priority === "High" ? "#fecaca" : cert.priority === "Medium" ? "#fde68a" : "#d1fae5",
                        color: cert.priority === "High" ? "#991b1b" : cert.priority === "Medium" ? "#92400e" : "#065f46",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}
                    >
                      {cert.priority}
                    </span>
                  </div>
                  <p style={{ color: "#6b21a8", fontSize: "14px" }}>{cert.relevance}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Career Path Suggestions */}
        {careerPathSuggestions && careerPathSuggestions.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px" }}>
              🚀 Career Path Suggestions
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "16px" }}>
              {careerPathSuggestions.map((career, index) => (
                <div
                  key={index}
                  style={{
                    padding: "20px",
                    background: "#fef2f2",
                    border: "2px solid #f87171",
                    borderRadius: "12px"
                  }}
                >
                  <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#b91c1c", marginBottom: "8px" }}>
                    {career.path}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#7f1d1d", marginBottom: "12px" }}>
                    ⏱️ Timeline: {career.timeline}
                  </p>
                  <p style={{ fontSize: "14px", color: "#7f1d1d", marginBottom: "12px" }}>
                    {career.reasoning}
                  </p>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "#b91c1c", marginBottom: "6px" }}>
                      Required Skills:
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {career.requiredSkills && career.requiredSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: "4px 10px",
                            background: "#fee2e2",
                            color: "#991b1b",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "500"
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section Analysis */}
        {sections && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px" }}>
              📊 Section-wise Analysis
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "16px"
              }}
            >
              {Object.entries(sections).map(([key, section]) => (
                <SectionCard
                  key={key}
                  title={formatSectionName(key)}
                  present={section.present}
                  score={section.score}
                  feedback={section.feedback}
                />
              ))}
            </div>
          </div>
        )}

        {/* Keywords */}
        {keywords && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px" }}>
              🔑 Keywords Analysis
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              {keywords.found && keywords.found.length > 0 && (
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#10b981" }}>
                    ✓ Found Keywords
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {keywords.found.map((keyword, index) => (
                      <span
                        key={index}
                        style={{
                          padding: "6px 12px",
                          background: "#dcfce7",
                          color: "#166534",
                          borderRadius: "16px",
                          fontSize: "14px",
                          fontWeight: "500"
                        }}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {keywords.missing && keywords.missing.length > 0 && (
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#ef4444" }}>
                    ✗ Missing Keywords
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {keywords.missing.map((keyword, index) => (
                      <span
                        key={index}
                        style={{
                          padding: "6px 12px",
                          background: "#fee2e2",
                          color: "#991b1b",
                          borderRadius: "16px",
                          fontSize: "14px",
                          fontWeight: "500"
                        }}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {keywords.suggestions && keywords.suggestions.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#3b82f6" }}>
                  💡 Keyword Suggestions
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {keywords.suggestions.map((suggestion, index) => (
                    <span
                      key={index}
                      style={{
                        padding: "6px 12px",
                        background: "#dbeafe",
                        color: "#1e40af",
                        borderRadius: "16px",
                        fontSize: "14px",
                        fontWeight: "500"
                      }}
                    >
                      {suggestion}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px" }}>
              💡 Actionable Suggestions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  style={{
                    padding: "16px",
                    background: "#eff6ff",
                    borderLeft: "4px solid #3b82f6",
                    borderRadius: "8px"
                  }}
                >
                  <p style={{ color: "#1e40af", lineHeight: "1.6" }}>
                    {index + 1}. {suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formatting Feedback */}
        {formatting && formatting.feedback && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px" }}>
              🎨 Formatting Feedback
            </h2>
            <div
              style={{
                padding: "16px",
                background: "#f3f4f6",
                borderRadius: "8px",
                border: "1px solid #d1d5db"
              }}
            >
              <p style={{ color: "#374151", lineHeight: "1.6" }}>{formatting.feedback}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/student/resume-analyzer/upload")}
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
              cursor: "pointer"
            }}
          >
            Analyze Another Resume
          </button>
          <button
            onClick={() => navigate("/student/resume-analyzer/history")}
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
              cursor: "pointer"
            }}
          >
            View History
          </button>
          <button
            onClick={() => window.print()}
            style={{
              flex: "1",
              minWidth: "200px",
              padding: "14px 24px",
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            🖨️ Print Report
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component for section cards
function SectionCard({ title, present, score, feedback }) {
  return (
    <div
      style={{
        padding: "20px",
        background: "#f9fafb",
        borderRadius: "8px",
        border: "1px solid #e5e7eb"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "600" }}>{title}</h3>
        <span
          style={{
            padding: "4px 12px",
            background: present ? "#dcfce7" : "#fee2e2",
            color: present ? "#166534" : "#991b1b",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "600"
          }}
        >
          {present ? "Present" : "Missing"}
        </span>
      </div>

      {present && (
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "14px", color: "#6b7280" }}>Score</span>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>
              {score}/100
            </span>
          </div>
          <div style={{ width: "100%", height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
            <div
              style={{
                width: `${score}%`,
                height: "100%",
                background: score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444",
                transition: "width 0.5s ease"
              }}
            />
          </div>
        </div>
      )}

      <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.5" }}>{feedback}</p>
    </div>
  );
}

// Helper function to format section names
function formatSectionName(key) {
  const names = {
    contactInfo: "Contact Information",
    summary: "Professional Summary",
    experience: "Work Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects"
  };
  return names[key] || key;
}

export default ResumeAnalysisResult;