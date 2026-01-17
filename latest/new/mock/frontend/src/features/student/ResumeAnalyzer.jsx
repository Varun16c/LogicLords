import { useNavigate } from "react-router-dom";

function ResumeAnalyzer() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", background: "#f9fafb", minHeight: "100vh" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "32px",
          maxWidth: "1100px",
          margin: "0 auto",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}
      >
        <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>
          Resume Analyzer
        </h1>

        <p style={{ color: "#6b7280", marginBottom: "32px" }}>
          Get AI-powered insights to improve your resume and increase your chances of getting hired.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px"
          }}
        >
          {/* Upload New Resume */}
          <FeatureCard
            title="Analyze Resume"
            description="Upload your resume and get instant AI-powered analysis with actionable feedback."
            icon="📄"
            color="#3b82f6"
            onClick={() => navigate("/student/resume-analyzer/upload")}
          />

          {/* View History */}
          <FeatureCard
            title="Analysis History"
            description="View all your previous resume analyses and track your improvements over time."
            icon="📊"
            color="#10b981"
            onClick={() => navigate("/student/resume-analyzer/history")}
          />
        </div>

        {/* Features Section */}
        <div style={{ marginTop: "48px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "24px" }}>
            What You'll Get
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
            <BenefitCard
              icon="✅"
              title="ATS Score"
              description="Check how well your resume performs with Applicant Tracking Systems"
            />
            <BenefitCard
              icon="🎯"
              title="Section Analysis"
              description="Detailed feedback on each resume section"
            />
            <BenefitCard
              icon="🔑"
              title="Keyword Suggestions"
              description="Important keywords you should include"
            />
            <BenefitCard
              icon="💡"
              title="Improvement Tips"
              description="Actionable suggestions to enhance your resume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon, color, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#f9fafb",
        borderRadius: "12px",
        padding: "32px",
        cursor: "pointer",
        border: "2px solid #e5e7eb",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "#e5e7eb";
      }}
    >
      <div
        style={{
          fontSize: "48px",
          marginBottom: "16px"
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>
        {title}
      </h3>
      <p style={{ color: "#6b7280", lineHeight: "1.6" }}>{description}</p>

      <div
        style={{
          position: "absolute",
          bottom: "16px",
          right: "16px",
          fontSize: "24px",
          color: color,
          fontWeight: "700"
        }}
      >
        →
      </div>
    </div>
  );
}

function BenefitCard({ icon, title, description }) {
  return (
    <div
      style={{
        padding: "20px",
        background: "#f9fafb",
        borderRadius: "8px",
        border: "1px solid #e5e7eb"
      }}
    >
      <div style={{ fontSize: "32px", marginBottom: "12px" }}>{icon}</div>
      <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
        {title}
      </h4>
      <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.5" }}>
        {description}
      </p>
    </div>
  );
}

export default ResumeAnalyzer;