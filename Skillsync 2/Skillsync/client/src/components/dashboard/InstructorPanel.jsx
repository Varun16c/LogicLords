import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../pages/Dashboard.css";

function InstructorPanel() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleNavigation = (page) => {
    if (page === "students") {
      navigate("/instructor/manage-students");
    } else if (page === "profile") {
      // Add profile navigation logic here
      console.log("Navigate to profile");
    } else if (page === "courses") {
  navigate("/instructor/course-management");
  }

  };

  return (
    <div className={`dashboard-container ${sidebarOpen ? "" : "collapsed"}`}>

      {/* ================= SIDEBAR ================= */}
      <aside className="dashboard-sidebar">
        <h2 className="dashboard-logo">Skill Portal</h2>

        <nav className="dashboard-nav">
          <button onClick={() => navigate("/instructor")}>
  <span className="icon">🏠</span>
  <span className="label">Dashboard</span>
</button>
          <button>
            <span className="icon">👤</span>
            <span className="label">My Profile</span>
          </button>

          <button>
            <span className="icon">📚</span>
            <span className="label">My Courses</span>
          </button>

          {/* FIXED: Add icon to Manage Students button and navigation */}
          <button onClick={() => navigate("/instructor/manage-students")}>
            <span className="icon">👨‍🎓</span>
            <span className="label">Manage Students</span>
          </button>
        </nav>

        {/* LOGOUT (BOTTOM) */}
        <button className="dashboard-logout" onClick={handleLogout}>
          <span className="icon">🚪</span>
          <span className="label">Logout</span>
        </button>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="dashboard-main">

        {/* HEADER */}
        <header className="dashboard-header">
          <div className="header-left">
            <button className="hamburger" onClick={toggleSidebar}>
              ☰
            </button>
            <h3>Instructor Dashboard</h3>
          </div>

          <div className="header-right">
            Welcome, <b>{name}</b>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="dashboard-hero">
          <div className="hero-card">
            <h2>Hello, {name} 👋</h2>
            <p>Manage your courses, uploads, and profile from here.</p>
          </div>

          <div className="stats">
            <div className="stat-box">
              <h4>📚 Courses</h4>
              <span>0</span>
            </div>



            <div className="stat-box">
              <h4>👨‍🎓 Students</h4>
              <span>0</span>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT - Big Card with 3 sections */}
        <section className="dashboard-content">
          <div className="big-management-card">
            <div
              className="manage-section profile-section"
              onClick={() => handleNavigation("profile")}
            >
              <div className="section-icon">👤</div>
              <div className="section-content">
                <h3>Manage Profile</h3>
                <p>Update your personal information and settings</p>
              </div>
              <div className="section-arrow">→</div>
            </div>

            <div
              className="manage-section courses-section"
              onClick={() => handleNavigation("courses")}
            >
              <div className="section-icon">📚</div>
              <div className="section-content">
                <h3>Manage Courses</h3>
                <p>Create, edit and organize your courses</p>
              </div>
              <div className="section-arrow">→</div>
            </div>

            <div
              className="manage-section students-section"
              onClick={() => handleNavigation("students")}
            >
              <div className="section-icon">👨‍🎓</div>
              <div className="section-content">
                <h3>Manage Students</h3>
                <p>View and manage enrolled students</p>
              </div>
              <div className="section-arrow">→</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default InstructorPanel; 