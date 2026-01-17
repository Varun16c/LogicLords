import { Routes, Route, Link } from "react-router-dom";
import Login from "./features/student/Login";
import MockInterviews from "./features/student/MockInterviews";
import MockInterviewLevels from "./features/student/MockInterviewLevels";
import MockInterviewSession from "./features/student/MockInterviewSession";
import MockInterviewResult from "./features/student/MockInterviewResult";
import ResumeAnalyzer from "./features/student/ResumeAnalyzer";
import ResumeUpload from "./features/student/ResumeUpload";
import ResumeAnalysisResult from "./features/student/ResumeAnalysisResult";
import ResumeHistory from "./features/student/ResumeHistory";

function App() {
  return (
    <>
      <nav style={{ padding: "20px", background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link to="/student/mock-interviews" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "600" }}>
            Mock Interviews
          </Link>
          <Link to="/student/resume-analyzer" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "600" }}>
            Resume Analyzer
          </Link>
        </div>
      </nav>

      <Routes>
        {/* Home - Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Mock Interview Routes */}
        <Route path="/student/mock-interviews" element={<MockInterviews />} />
        <Route path="/student/mock-interviews/:type" element={<MockInterviewLevels />} />
        <Route path="/student/mock-interviews/session" element={<MockInterviewSession />} />
        <Route path="/student/mock-interview/result" element={<MockInterviewResult />} />

        {/* Resume Analyzer Routes */}
        <Route path="/student/resume-analyzer" element={<ResumeAnalyzer />} />
        <Route path="/student/resume-analyzer/upload" element={<ResumeUpload />} />
        <Route path="/student/resume-analyzer/result" element={<ResumeAnalysisResult />} />
        <Route path="/student/resume-analyzer/history" element={<ResumeHistory />} />
      </Routes>
    </>
  );
}

export default App;