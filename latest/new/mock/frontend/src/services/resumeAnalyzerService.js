import axios from "axios";

const API_URL = "http://localhost:5000/api/resume-analyzer";

// Get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Upload and analyze resume
export const analyzeResume = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  const token = localStorage.getItem("token");
  const response = await axios.post(`${API_URL}/analyze`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};

// Get analysis history
export const getAnalysisHistory = async () => {
  const response = await axios.get(`${API_URL}/history`, getAuthHeader());
  return response.data;
};

// Get single analysis
export const getAnalysisById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

// Delete analysis
export const deleteAnalysis = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};