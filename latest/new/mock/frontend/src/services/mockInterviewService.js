import axios from "axios";

export const generateQuestions = async (type, difficulty) => {
  const res = await axios.post(
    "http://localhost:5000/api/mock-interviews/generate-questions",
    { type, difficulty }
  );
  return res.data;
};


export const submitAnswers = async (type, difficulty, questions, answers) => {
  const token = localStorage.getItem("token");

  const res = await axios.post(
    `${API}/submit-answers`,
    { type, difficulty, questions, answers },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
};

export const fetchHistory = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};
