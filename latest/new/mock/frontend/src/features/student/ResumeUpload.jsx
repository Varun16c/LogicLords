import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeResume } from "../../services/resumeAnalyzerService";

function ResumeUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (file) => {
    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF, DOC, or DOCX file");
      return;
    }

    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      return;
    }

    setFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    try {
      setUploading(true);
      console.log("📤 Uploading resume...");

      const result = await analyzeResume(file);

      console.log("✅ Analysis complete:", result);

      // Navigate to result page
      navigate("/student/resume-analyzer/result", {
        state: {
          analysisId: result.analysisId,
          fileName: result.fileName,
          analysis: result.analysis
        }
      });
    } catch (error) {
      console.error("❌ Upload failed:", error);
      alert(error.response?.data?.error || "Failed to analyze resume. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "40px", background: "#f9fafb", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "12px",
          padding: "40px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>
          Upload Your Resume
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "32px" }}>
          Upload your resume in PDF, DOC, or DOCX format (max 5MB)
        </p>

        {/* Drag and Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? "#3b82f6" : "#d1d5db"}`,
            borderRadius: "12px",
            padding: "48px",
            textAlign: "center",
            background: dragActive ? "#eff6ff" : "#f9fafb",
            transition: "all 0.3s ease",
            cursor: "pointer",
            marginBottom: "24px"
          }}
          onClick={() => document.getElementById("fileInput").click()}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>
            📄
          </div>

          {file ? (
            <>
              <p style={{ fontSize: "18px", fontWeight: "600", color: "#10b981", marginBottom: "8px" }}>
                ✓ {file.name}
              </p>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                style={{
                  marginTop: "12px",
                  padding: "8px 16px",
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Remove File
              </button>
            </>
          ) : (
            <>
              <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
                Drag and drop your resume here
              </p>
              <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
                or click to browse
              </p>
              <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                Supported formats: PDF, DOC, DOCX (max 5MB)
              </p>
            </>
          )}

          <input
            id="fileInput"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          style={{
            width: "100%",
            padding: "16px",
            background: !file || uploading ? "#9ca3af" : "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: !file || uploading ? "not-allowed" : "pointer",
            transition: "0.2s",
            marginBottom: "16px"
          }}
        >
          {uploading ? "Analyzing Resume... 🔄" : "Analyze Resume"}
        </button>

        <button
          onClick={() => navigate("/student/resume-analyzer")}
          style={{
            width: "100%",
            padding: "12px",
            background: "#e5e7eb",
            color: "#374151",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            cursor: "pointer"
          }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

export default ResumeUpload;