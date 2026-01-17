import React, { useEffect, useState } from "react";
import { fetchHistory } from "../../services/mockInterviewService";

const MockInterviewHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory().then((res) => setHistory(res.attempts));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Interview History</h2>

      {history.map((item, i) => (
        <div key={i} className="border p-4 mb-3 rounded">
          <p><strong>Type:</strong> {item.type}</p>
          <p><strong>Difficulty:</strong> {item.difficulty}</p>
          <p><strong>Score:</strong> {item.score}/50</p>
        </div>
      ))}
    </div>
  );
};

export default MockInterviewHistory;
