// client/src/services/mockInterviewService.js
import axiosInstance from "../utils/axiosConfig";

const API_BASE = "/api/mock-interviews";

export const mockInterviewService = {
  /**
   * Generate interview questions
   */
  generateQuestions: async (type, difficulty) => {
    try {
      const response = await axiosInstance.post(`${API_BASE}/generate-questions`, {
        type,
        difficulty
      });
      return response.data;
    } catch (error) {
      console.error("Error generating questions:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Submit answers and get evaluation
   */
  submitAnswers: async (type, difficulty, questions, answers) => {
    try {
      const response = await axiosInstance.post(`${API_BASE}/submit-answers`, {
        type,
        difficulty,
        questions,
        answers
      });
      return response.data;
    } catch (error) {
      console.error("Error submitting answers:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get interview history
   */
  getHistory: async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE}/history`);
      return response.data;
    } catch (error) {
      console.error("Error fetching history:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get single attempt details
   */
  getAttemptDetails: async (attemptId) => {
    try {
      const response = await axiosInstance.get(`${API_BASE}/attempt/${attemptId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching attempt details:", error);
      throw error.response?.data || error;
    }
  }
};

export default mockInterviewService;