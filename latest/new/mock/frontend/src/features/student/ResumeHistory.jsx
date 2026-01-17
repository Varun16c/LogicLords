import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAnalysisHistory, deleteAnalysis } from "../../services/resumeAnalyzerService";

function ResumeHistory() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getAnalysisHistory();
      setAnalyses(data.analyses);
    } catch (error) {
      console.error("Error fetching history:", error);
      alert("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this analysis?")) {
      return;
    }

    try {
      setDeleting(id);
      await deleteAnalysis(id);
      setAnalyses(analyses.filter((a) => a._id !== id));
    } catch (error) {
      console.error("Error deleting analysis:", error);
      alert("Failed to delete analysis");
    } finally {
      setDeleting(null);
    }
  };

  const handleView = (analysis) => {
    navigate("/student/resume-analyzer/result", {
      state: {
        analysisId: analysis._id,
        fileName: analysis.fileName,
        analysis: analysis.analysis
      }
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔄</div>
        <p style={{ fontSize: "18px", color: "#6b7280" }}>Loading history...</p>
      </div>
    );
  }

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
        <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>
              Analysis History
            </h1>
            <p style={{ color: "#6b7280" }}>
              View all your previous resume analyses
            </p>
          </div>
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
            + New Analysis
          </button>
        </div>

        {/* No Data */}
        {analyses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>📄</div>
            <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "8px" }}>
              No analyses yet
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>
              Upload your first resume to get started
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
        ) : (
          /* History List */
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {analyses.map((analysis) => (
              <div
                key={analysis._id}
                style={{
                  padding: "24px",
                  background: "#f9fafb",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "24px",
                  alignItems: "center"
                }}
              >
                {/* Left Side - Info */}
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
                    📄 {analysis.fileName}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "12px" }}>
                    Analyzed on {formatDate(analysis.createdAt)}
                  </p>

                  {/* Scores */}
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                    <div>
                      <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                        Overall Score
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: getScoreColor(analysis.analysis.overallScore),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: "700",
                            fontSize: "14px"
                          }}
                        >
                          {analysis.analysis.overallScore}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                        ATS Score
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: getScoreColor(analysis.analysis.atsScore),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: "700",
                            fontSize: "14px"
                          }}
                        >
                          {analysis.analysis.atsScore}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button
                    onClick={() => handleView(analysis)}
                    style={{
                      padding: "10px 20px",
                      background: "#3b82f6",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      whiteSpace: "nowrap"
                    }}
                  >
                    View Report
                  </button>
                  <button
                    onClick={() => handleDelete(analysis._id)}
                    disabled={deleting === analysis._id}
                    style={{
                      padding: "10px 20px",
                      background: deleting === analysis._id ? "#9ca3af" : "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: deleting === analysis._id ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {deleting === analysis._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => navigate("/student/resume-analyzer")}
          style={{
            marginTop: "24px",
            padding: "12px 24px",
            background: "#e5e7eb",
            color: "#374151",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            cursor: "pointer"
          }}
        >
          ← Back to Resume Analyzer
        </button>
      </div>
    </div>
  );
}

export default ResumeHistory;