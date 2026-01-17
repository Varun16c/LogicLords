// client/src/components/dashboard/StudentPanel.jsx - UPDATED
import { Outlet, useNavigate } from "react-router-dom";
import "../../pages/Dashboard.css";

function StudentPanel() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Student";

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      {/* ================= SIDEBAR ================= */}
      <aside className="dashboard-sidebar">
        <h2 className="dashboard-logo">🎓 Student</h2>

        <nav className="dashboard-nav">
          <button onClick={() => navigate("/student")}>
            <span className="icon">🏠</span>
            <span className="label">Dashboard</span>
          </button>

          <button onClick={() => navigate("/student/courses")}>
            <span className="icon">📚</span>
            <span className="label">Courses</span>
          </button>

          {/* ✅ NEW: Mock Interview Button */}
          <button onClick={() => navigate("/student/mock-interviews")}>
            <span className="icon">🎯</span>
            <span className="label">Mock Interview</span>
          </button>

          <button onClick={() => navigate("/student/profile")}>
            <span className="icon">👤</span>
            <span className="label">Profile</span>
          </button>
        </nav>

        {/* LOGOUT */}
        <button className="dashboard-logout" onClick={handleLogout}>
          <span className="icon">🚪</span>
          <span className="label">Logout</span>
        </button>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <h3>Student Dashboard</h3>
          </div>

          <div className="header-right">
            Welcome, <b>{name}</b>
          </div>
        </header>

        {/* ================= PAGE CONTENT ================= */}
        <section className="dashboard-content">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

export default StudentPanel;