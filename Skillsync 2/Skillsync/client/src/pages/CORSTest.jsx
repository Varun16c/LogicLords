// client/src/pages/CORSTest.jsx - Temporary test component
import { useState } from "react";
import axiosInstance from "../utils/axiosConfig";

function CORSTest() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testBasicFetch = async () => {
    try {
      setError(null);
      setResult("Testing...");
      const response = await fetch('http://localhost:5000/api/test-cors');
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err.message);
    }
  };

  const testAxios = async () => {
    try {
      setError(null);
      setResult("Testing...");
      const response = await axiosInstance.get('/api/test-cors');
      setResult(JSON.stringify(response.data, null, 2));
    } catch (err) {
      setError(err.message);
    }
  };

  const testMockInterview = async () => {
    try {
      setError(null);
      setResult("Testing...");
      const response = await axiosInstance.post('/api/mock-interviews/generate-questions', {
        type: 'hr',
        difficulty: 'easy'
      });
      setResult(JSON.stringify(response.data, null, 2));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>CORS Test Page</h1>
      
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={testBasicFetch} style={buttonStyle}>
          Test Basic Fetch
        </button>
        <button onClick={testAxios} style={buttonStyle}>
          Test Axios
        </button>
        <button onClick={testMockInterview} style={buttonStyle}>
          Test Mock Interview API
        </button>
      </div>

      {error && (
        <div style={{ background: "#fee", padding: "15px", borderRadius: "5px", marginBottom: "20px" }}>
          <h3 style={{ color: "red" }}>❌ Error:</h3>
          <pre>{error}</pre>
        </div>
      )}

      {result && (
        <div style={{ background: "#efe", padding: "15px", borderRadius: "5px" }}>
          <h3 style={{ color: "green" }}>✅ Result:</h3>
          <pre>{result}</pre>
        </div>
      )}

      <div style={{ marginTop: "30px", background: "#f5f5f5", padding: "15px", borderRadius: "5px" }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Make sure backend is running on http://localhost:5000</li>
          <li>Click each test button to check CORS</li>
          <li>Check browser console for detailed logs</li>
          <li>If tests pass, CORS is working correctly</li>
        </ol>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: "10px 20px",
  background: "#4f46e5",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600"
};

export default CORSTest;