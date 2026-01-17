import axios from 'axios';

const API_URL = 'http://localhost:5000';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const submitExam = async (submissionData) => {
  try {
    const res = await axios.post(
      `${API_URL}/submissions/submit`,
      submissionData,
      { headers: getAuthHeader() }
    );
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to submit exam');
  }
};

export const getSubmissionReport = async (submissionId) => {
  try {
    const res = await axios.get(
      `${API_URL}/submissions/report/${submissionId}`,
      { headers: getAuthHeader() }
    );
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch report');
  }
};

export const saveSnapshot = async (snapshotData) => {
  try {
    await axios.post(
      `${API_URL}/submissions/snapshot`,
      snapshotData,
      { headers: getAuthHeader() }
    );
  } catch (error) {
    console.error('Snapshot save failed:', error);
  }
};