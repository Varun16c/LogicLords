import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import CodeEditor from "./CodeEditor";
import { runCode } from "../services/compilerApi";
import { getExamById } from "../services/examApi";
import { submitExam, saveSnapshot } from "../services/submissionApi";
import { logout } from "../utils/auth";
import SubmissionModal from "./SubmissionModal";

import "../styles/compiler.css";

const defaultCode = {
  javascript: "// Write your JavaScript code here",
  python: "# Write your Python code here",
  cpp: "// Write your C++ code here",
  c: "// Write your C code here",
  java: "// Write your Java code here\n// Class name must be Main"
};

const MAX_TAB_SWITCH = 5;
const BLUR_TIMEOUT = 5000;
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

const Compiler = () => {
  const navigate = useNavigate();
  const { examId } = useParams();

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(defaultCode.javascript);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [warning, setWarning] = useState("");

  // Exam data from database
  const [exam, setExam] = useState(null);
  const [loadingExam, setLoadingExam] = useState(true);

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const blurTimerRef = useRef(null);
  const examTimerRef = useRef(null);

  // NEW: Submission tracking
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [startTime, setStartTime] = useState(new Date().toISOString()); // Initialize immediately
  const [tabSwitchLog, setTabSwitchLog] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ================= FETCH EXAM DATA ================= */
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const data = await getExamById(examId);
        setExam(data);
        setTimeRemaining(data.duration_minutes * 60); // Convert to seconds
        // startTime is already initialized above
      } catch (err) {
        alert(err.message);
        navigate("/student/dashboard");
      } finally {
        setLoadingExam(false);
      }
    };

    if (examId) {
      fetchExam();
    }
  }, [examId, navigate]);

  /* ================= AUTO-SAVE CODE EVERY 30 SECONDS ================= */
  useEffect(() => {
    if (!exam || isSubmitted || !code) return;

    const interval = setInterval(() => {
      // Only save if code has meaningful content
      if (code.trim().length > 20) {
        saveSnapshot({
          exam_id: examId,
          code,
          language
        }).catch(err => console.error('Auto-save failed:', err));
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [code, language, exam, examId, isSubmitted]);

  /* ================= COUNTDOWN TIMER ================= */
  useEffect(() => {
    if (timeRemaining <= 0 || isSubmitted) return;

    examTimerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(examTimerRef.current);
          autoSubmit("Time is up");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (examTimerRef.current) {
        clearInterval(examTimerRef.current);
      }
    };
  }, [timeRemaining, isSubmitted]);

  /* ================= FORMAT TIME ================= */
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  /* ================= WARNING ================= */
  const showWarning = (msg) => {
    setWarning(msg);
    setTimeout(() => setWarning(""), 3000);
  };

  /* ================= AUTO SUBMIT ================= */
  const autoSubmit = async (reason) => {
    if (isSubmitted || isSubmitting) return;
    
    setIsSubmitted(true);
    setIsSubmitting(true);
    showWarning(`🚫 Test auto-submitted: ${reason}`);

    try {
      console.log('Auto-submitting with data:', {
        exam_id: examId,
        code_length: code?.length,
        language,
        start_time: startTime,
        tab_switches_count: tabSwitchLog.length
      });

      const result = await submitExam({
        exam_id: examId,
        code: code || "// No code written",
        language,
        start_time: startTime,
        tab_switches: tabSwitchLog,
        is_auto_submitted: true,
        auto_submit_reason: reason
      });

      console.log('Auto-submit successful:', result);

      // Redirect to report page after 2 seconds
      setTimeout(() => {
        navigate(`/report/${result.submission_id}`);
      }, 2000);
    } catch (error) {
      console.error('Auto-submission error:', error);
      alert(`Failed to auto-submit: ${error.message}. Please contact your instructor.`);
      setIsSubmitted(false);
      setIsSubmitting(false);
    }
  };

  /* ================= COPY / PASTE BLOCK ================= */
  useEffect(() => {
    const block = (e) => {
      e.preventDefault();
      showWarning("⚠️ Copy / Paste is not allowed");
    };

    const blockKeys = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "v", "x", "a"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        showWarning("⚠️ Copy / Paste is not allowed");
      }
    };

    document.addEventListener("copy", block);
    document.addEventListener("paste", block);
    document.addEventListener("cut", block);
    document.addEventListener("contextmenu", block);
    document.addEventListener("keydown", blockKeys);

    return () => {
      document.removeEventListener("copy", block);
      document.removeEventListener("paste", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("keydown", blockKeys);
    };
  }, []);

  /* ================= TAB SWITCH MONITOR (WITH LOGGING) ================= */
  useEffect(() => {
    const handleBlur = () => {
      if (isSubmitted) return;

      const count = tabSwitchCount + 1;
      setTabSwitchCount(count);

      // Log the blur event with timestamp
      const blurEvent = {
        timestamp: new Date().toISOString(),
        event_type: 'blur',
        count: count
      };
      setTabSwitchLog(prev => [...prev, blurEvent]);

      showWarning(`⚠️ Tab switched (${count}/${MAX_TAB_SWITCH})`);

      // Set timeout for auto-submit if user doesn't return
      blurTimerRef.current = setTimeout(() => {
        autoSubmit("Did not return within 5 seconds");
      }, BLUR_TIMEOUT);

      // Auto-submit if max switches exceeded
      if (count >= MAX_TAB_SWITCH) {
        autoSubmit("Too many tab switches");
      }
    };

    const handleFocus = () => {
      // Clear the timeout when user returns
      if (blurTimerRef.current) {
        clearTimeout(blurTimerRef.current);
        blurTimerRef.current = null;

        // Log the focus event
        const focusEvent = {
          timestamp: new Date().toISOString(),
          event_type: 'focus'
        };
        setTabSwitchLog(prev => [...prev, focusEvent]);
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [tabSwitchCount, isSubmitted]);

  /* ================= LANGUAGE CHANGE ================= */
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(defaultCode[lang]);
    setInput("");
    setOutput("");
  };

  /* ================= RUN CODE ================= */
  const handleRun = async () => {
    if (isSubmitted) return;

    setLoading(true);
    setOutput("Running...");
    try {
      const result = await runCode(code, language, input);
      setOutput(result);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /* ================= MANUAL SUBMIT (SHOWS MODAL) ================= */
  const handleSubmit = () => {
    setShowSubmitModal(true);
  };

  /* ================= CONFIRM SUBMISSION ================= */
  const confirmSubmit = async () => {
    setShowSubmitModal(false);
    setIsSubmitted(true);
    setIsSubmitting(true);
    showWarning("✅ Submitting your test...");

    try {
      console.log('Manual submit with data:', {
        exam_id: examId,
        code_length: code?.length,
        language,
        start_time: startTime,
        tab_switches_count: tabSwitchLog.length
      });

      const result = await submitExam({
        exam_id: examId,
        code: code || "// No code written",
        language,
        start_time: startTime,
        tab_switches: tabSwitchLog,
        is_auto_submitted: false,
        auto_submit_reason: null
      });

      console.log('Manual submit successful:', result);
      showWarning("✅ Test submitted successfully!");

      // Redirect to report page after 1.5 seconds
      setTimeout(() => {
        navigate(`/report/${result.submission_id}`);
      }, 1500);
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Failed to submit: ${error.message}. Please try again.`);
      setIsSubmitted(false);
      setIsSubmitting(false);
    }
  };

  if (loadingExam) {
    return (
      <div className="compiler-container">
        <div style={{ textAlign: "center", padding: "50px", color: "#e5e7eb" }}>
          Loading exam...
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="compiler-container">
        <div style={{ textAlign: "center", padding: "50px", color: "#e5e7eb" }}>
          Exam not found
        </div>
      </div>
    );
  }

  return (
    <div className="compiler-container">
      <div className="layout">

        {/* ================= QUESTION SECTION (FROM DB) ================= */}
        <div className="question-panel">
          <h3>{exam.title}</h3>
          
          <div style={{ 
            background: timeRemaining < 300 ? "#dc2626" : "#22c55e", 
            padding: "12px", 
            borderRadius: "8px", 
            textAlign: "center",
            marginBottom: "16px",
            fontWeight: "700",
            fontSize: "18px"
          }}>
            ⏱️ Time Remaining: {formatTime(timeRemaining)}
          </div>

          <h4>Problem</h4>
          <p style={{ whiteSpace: "pre-wrap" }}>{exam.question}</p>

          {exam.sample_input && (
            <>
              <h4>Sample Input</h4>
              <pre>{exam.sample_input}</pre>
            </>
          )}

          {exam.sample_output && (
            <>
              <h4>Sample Output</h4>
              <pre>{exam.sample_output}</pre>
            </>
          )}

          {exam.test_cases && exam.test_cases.length > 0 && (
            <>
              <h4>Test Cases</h4>
              <ul>
                {exam.test_cases.map((tc, i) => (
                  <li key={i}>
                    Input: {tc.input} → Output: {tc.output}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* ================= COMPILER SECTION ================= */}
        <div className="compiler-card">

          {warning && <div className="warning-banner">{warning}</div>}

          <div className="compiler-header">
            <div className="nav-buttons">
              <button onClick={() => navigate("/student/dashboard")}>
                ← Back
              </button>

              <button
                style={{ background: "#dc2626", color: "white" }}
                onClick={() => logout(navigate)}
              >
                Logout
              </button>
            </div>

            <h2>SkillSync — Online Compiler</h2>

            <div className="header-right">
              <span className="tab-counter">
                Tab switches: {tabSwitchCount}/{MAX_TAB_SWITCH}
              </span>

              <select
                value={language}
                onChange={handleLanguageChange}
                disabled={isSubmitted}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="java">Java</option>
              </select>
            </div>
          </div>

          <CodeEditor
            code={code}
            setCode={setCode}
            language={language}
            disabled={isSubmitted || timeRemaining === 0}
          />

          <div className="io-section">
            <div className="io-box">
              <label>Input</label>
              <textarea
                value={input}
                disabled={isSubmitted || timeRemaining === 0}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            <div className="io-box">
              <label>Output</label>
              <pre>{output || "No output yet"}</pre>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              onClick={handleRun} 
              disabled={isSubmitted || loading || timeRemaining === 0}
            >
              {loading ? "Running..." : "Run Code"}
            </button>

            <button 
              onClick={handleSubmit} 
              disabled={isSubmitted || timeRemaining === 0 || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Code"}
            </button>
          </div>

        </div>
      </div>

      {/* ================= SUBMISSION CONFIRMATION MODAL ================= */}
      <SubmissionModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={confirmSubmit}
        tabSwitchCount={tabSwitchCount}
      />
    </div>
  );
};

export default Compiler;