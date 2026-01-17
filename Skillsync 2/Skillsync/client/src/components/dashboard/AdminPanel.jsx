import { Link } from "react-router-dom";

export default function AdminPanel() {

  

  // ✅ ADD THIS FUNCTION HERE
  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>SkillSync</h2>

        <nav style={styles.nav}>
          <Link to="/admin/dashboard" style={styles.navItem}>
            🏠 Dashboard
          </Link>
          <Link to="/admin/instructors" style={styles.navItem}>
            🧑‍🏫 Manage Instructors
          </Link>
        </nav>

        {/* ✅ LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          style={{
            background: "#d9534f",
            color: "#fff",
            border: "none",
            padding: "10px 15px",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <header style={styles.header}>
          <h2>Admin Dashboard</h2>
          <span>Welcome, Admin</span>
        </header>

        <div style={styles.hero}>
          <h3>Hello, Admin 👋</h3>
          <p>Manage instructors and platform operations</p>
        </div>

        <div style={styles.cardGrid}>
          <div style={styles.card}>
            <h4>Manage Profile</h4>
            <p>Update admin credentials</p>
            <span style={styles.arrow}>→</span>
          </div>

          <Link
            to="/admin/instructors"
            style={{ ...styles.card, textDecoration: "none" }}
          >
            <h4>Manage Instructors</h4>
            <p>Approve, reject & view instructors</p>
            <span style={styles.arrow}>→</span>
          </Link>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#f4f6fb",
    fontFamily: "sans-serif",
  },
  sidebar: {
    width: "240px",
    background: "#2f3192",
    color: "#fff",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  logo: {
    marginBottom: "30px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  navItem: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "16px",
  },
  main: {
    flex: 1,
    padding: "30px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "30px",
  },
  hero: {
    background: "linear-gradient(135deg, #3b3dbf, #4f52d1)",
    color: "#fff",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "30px",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    color: "#000",
    cursor: "pointer",
  },
  arrow: {
    float: "right",
    fontSize: "20px",
  },
};
