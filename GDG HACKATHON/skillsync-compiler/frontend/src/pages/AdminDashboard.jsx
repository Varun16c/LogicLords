import { useNavigate } from "react-router-dom";
import { getUserFromToken, logout } from "../utils/auth";
import { useState, useEffect } from "react";
import { parseExcelFile, createExam, getAllExams, deleteExam } from "../services/examApi";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = getUserFromToken();

  const [title, setTitle] = useState("");
  const [marks, setMarks] = useState("");
  const [duration, setDuration] = useState("");

  const [question, setQuestion] = useState("");
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [solution, setSolution] = useState("");

  const [excelFile, setExcelFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [showExams, setShowExams] = useState(false);

  useEffect(() => {
    if (showExams) {
      fetchExams();
    }
  }, [showExams]);

  const fetchExams = async () => {
    try {
      const data = await getAllExams();
      setExams(data);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelFile(file);
    setLoading(true);

    try {
      const parsed = await parseExcelFile(file);
      setQuestion(parsed.question);
      setSampleInput(parsed.sample_input);
      setSampleOutput(parsed.sample_output);
      setTestCases(parsed.test_cases);
      setSolution(parsed.solution);
      alert("Excel parsed successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", output: "" }]);
  };

  const updateTestCase = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const removeTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleCreateExam = async () => {
    if (!title || !marks || !duration || !question || testCases.length === 0) {
      alert("Please fill all required fields and add at least one test case");
      return;
    }

    setLoading(true);

    try {
      await createExam({
        title,
        marks: parseInt(marks),
        duration_minutes: parseInt(duration),
        question,
        sample_input: sampleInput,
        sample_output: sampleOutput,
        test_cases: testCases,
        solution
      });

      alert("Exam created successfully!");
      
      // Reset form
      setTitle("");
      setMarks("");
      setDuration("");
      setQuestion("");
      setSampleInput("");
      setSampleOutput("");
      setTestCases([]);
      setSolution("");
      setExcelFile(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;

    try {
      await deleteExam(id);
      alert("Exam deleted successfully!");
      fetchExams();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={styles.viewport}>
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Welcome, {user?.name}</h1>
            <span style={styles.roleBadge}>{user?.role}</span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              style={styles.viewExamsBtn} 
              onClick={() => setShowExams(!showExams)}
            >
              {showExams ? "Hide Exams" : "View All Exams"}
            </button>
            <button style={styles.logoutBtn} onClick={() => logout(navigate)}>
              Logout
            </button>
          </div>
        </div>

        {!showExams ? (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Create Coding Exam</h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>Exam Title *</label>
              <input
                style={styles.input}
                placeholder="Enter exam title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Duration (minutes) *</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="90"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Total Marks *</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="100"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                />
              </div>
            </div>

            <div style={styles.divider}>
              <span style={styles.dividerText}>Upload Excel to Auto-Fill</span>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Upload Excel File (Question, Sample_Input, Sample_Output, Test_Cases, Solution)
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                style={styles.fileInput}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Question *</label>
              <textarea
                style={{ ...styles.input, minHeight: "120px" }}
                placeholder="Enter the problem statement"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Sample Input</label>
                <textarea
                  style={styles.input}
                  placeholder="5"
                  value={sampleInput}
                  onChange={(e) => setSampleInput(e.target.value)}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Sample Output</label>
                <textarea
                  style={styles.input}
                  placeholder="5"
                  value={sampleOutput}
                  onChange={(e) => setSampleOutput(e.target.value)}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Test Cases *</label>
              {testCases.map((tc, i) => (
                <div key={i} style={styles.testCaseRow}>
                  <input
                    style={styles.testCaseInput}
                    placeholder="Input"
                    value={tc.input}
                    onChange={(e) => updateTestCase(i, "input", e.target.value)}
                  />
                  <input
                    style={styles.testCaseInput}
                    placeholder="Expected Output"
                    value={tc.output}
                    onChange={(e) => updateTestCase(i, "output", e.target.value)}
                  />
                  <button style={styles.removeBtn} onClick={() => removeTestCase(i)}>
                    ✕
                  </button>
                </div>
              ))}
              <button style={styles.addTestBtn} onClick={addTestCase}>
                + Add Test Case
              </button>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Solution (Optional)</label>
              <textarea
                style={{ ...styles.input, minHeight: "100px", fontFamily: "monospace" }}
                placeholder="Enter the solution code"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
              />
            </div>

            <button
              style={styles.createBtn}
              onClick={handleCreateExam}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Exam"}
            </button>
          </div>
        ) : (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>All Exams</h2>
            {exams.length === 0 ? (
              <p style={{ textAlign: "center", color: "#94a3b8" }}>No exams created yet</p>
            ) : (
              exams.map((exam) => (
                <div key={exam.id} style={styles.examCard}>
                  <div>
                    <h3 style={styles.examTitle}>{exam.title}</h3>
                    <p style={styles.examMeta}>
                      Duration: {exam.duration_minutes} min | Marks: {exam.marks}
                    </p>
                    <p style={styles.examMeta}>
                      Created by: {exam.creator_name || "Unknown"}
                    </p>
                  </div>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDeleteExam(exam.id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        )}
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
    maxWidth: "1200px",
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
    background: "#2563eb",
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
  viewExamsBtn: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
  card: {
    maxWidth: "900px",
    margin: "0 auto",
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
  formGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "18px",
  },
  label: {
    marginBottom: "6px",
    fontSize: "14px",
    color: "#c7d2fe",
  },
  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #1e293b",
    background: "#020617",
    color: "#e5e7eb",
    fontSize: "14px",
  },
  row: {
    display: "flex",
    gap: "16px",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "24px 0",
  },
  dividerText: {
    padding: "0 10px",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "600",
  },
  fileInput: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #1e293b",
    background: "#020617",
    color: "#e5e7eb",
    fontSize: "14px",
    cursor: "pointer",
  },
  testCaseRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
  },
  testCaseInput: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #1e293b",
    background: "#020617",
    color: "#e5e7eb",
    fontSize: "14px",
  },
  removeBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  addTestBtn: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    marginTop: "8px",
  },
  createBtn: {
    width: "100%",
    padding: "14px",
    background: "#22c55e",
    border: "none",
    borderRadius: "12px",
    color: "#022c22",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "16px",
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
  },
  examTitle: {
    margin: "0 0 8px 0",
    fontSize: "18px",
    fontWeight: "600",
  },
  examMeta: {
    margin: "4px 0",
    fontSize: "13px",
    color: "#94a3b8",
  },
  deleteBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default AdminDashboard;