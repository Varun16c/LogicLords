import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Compiler from "./components/Compiler";
import ReportPage from "./pages/ReportPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* DEFAULT: LOGIN */}
        <Route path="/" element={<Login />} />

        {/* REGISTER */}
        <Route path="/register" element={<Register />} />

        {/* STUDENT DASHBOARD */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["instructor", "recruiter"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* TEST / COMPILER PAGE */}
        <Route
          path="/test/:examId"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Compiler />
            </ProtectedRoute>
          }
        />

        {/* PLAGIARISM REPORT PAGE */}
        <Route
          path="/report/:submissionId"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <ReportPage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;