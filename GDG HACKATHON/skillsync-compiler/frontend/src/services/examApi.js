import axios from "axios";

const API_URL = "http://localhost:5000";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const parseExcelFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(`${API_URL}/exams/parse-excel`, formData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data"
      }
    });

    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to parse Excel");
  }
};

export const createExam = async (examData) => {
  try {
    const res = await axios.post(`${API_URL}/exams/create`, examData, {
      headers: getAuthHeader()
    });

    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to create exam");
  }
};

export const getAllExams = async () => {
  try {
    const res = await axios.get(`${API_URL}/exams`, {
      headers: getAuthHeader()
    });

    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch exams");
  }
};

export const getExamById = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/exams/${id}`, {
      headers: getAuthHeader()
    });

    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch exam");
  }
};

export const updateExam = async (id, examData) => {
  try {
    const res = await axios.put(`${API_URL}/exams/${id}`, examData, {
      headers: getAuthHeader()
    });

    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to update exam");
  }
};

export const deleteExam = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/exams/${id}`, {
      headers: getAuthHeader()
    });

    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to delete exam");
  }
};