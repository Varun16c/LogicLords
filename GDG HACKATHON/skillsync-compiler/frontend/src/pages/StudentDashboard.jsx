import { useNavigate } from "react-router-dom";
import { logout, getUserFromToken } from "../utils/auth";
import { useState, useEffect } from "react";
import { getAllExams } from "../services/examApi";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = getUserFromToken();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const data = await getAllExams();
      setExams(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startExam = (examId) => {
    navigate(`/test/${examId}`);
  };

  return (
    <div style={styles.viewport}>
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Welcome, {user?.name}</h1>
            <span style={styles.roleBadge}>{user?.role}</span>
          </div>

          <button style={styles.logoutBtn} onClick={() => logout(navigate)}>
            Logout
          </button>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Available Exams</h2>

          {loading ? (
            <p style={{ textAlign: "center", color: "#94a3b8" }}>Loading exams...</p>
          ) : exams.length === 0 ? (
            <p style={{ textAlign: "center", color: "#94a3b8" }}>No exams available</p>
          ) : (
            exams.map((exam) => (
              <div key={exam.id} style={styles.examCard}>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.examTitle}>{exam.title}</h3>
                  <div style={styles.examDetails}>
                    <span style={styles.examBadge}>⏱️ {exam.duration_minutes} min</span>
                    <span style={styles.examBadge}>📝 {exam.marks} marks</span>
                  </div>
                </div>
                <button style={styles.startBtn} onClick={() => startExam(exam.id)}>
                  Start Exam
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  viewport: {
    width: "100vw",
    minHeight: "100vh",
    background: "#020617",
    display: "flex",
    justifyContent: "center",
  },
  page: {
    width: "100%",
    maxWidth: "1000px",
    padding: "32px",
    color: "#e5e7eb",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
  },
  roleBadge: {
    marginTop: "6px",
    display: "inline-block",
    padding: "6px 14px",
    borderRadius: "999px",
    background: "#22c55e",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  logoutBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
  card: {
    background: "#0f172a",
    padding: "28px",
    borderRadius: "18px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
  },
  cardTitle: {
    marginBottom: "24px",
    fontSize: "22px",
    fontWeight: "600",
  },
  examCard: {
    background: "#020617",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #1e293b",
    transition: "all 0.2s",
  },
  examTitle: {
    margin: "0 0 12px 0",
    fontSize: "18px",
    fontWeight: "600",
  },
  examDetails: {
    display: "flex",
    gap: "12px",
  },
  examBadge: {
    background: "#1e293b",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    color: "#cbd5e1",
  },
  startBtn: {
    background: "#22c55e",
    color: "#022c22",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
    transition: "all 0.2s",
  },
};

export default StudentDashboard;