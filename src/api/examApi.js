import axiosInstance from "./axiosInstance";

export const getMyExams = () => axiosInstance.get("/exams");

export const createExam = (data) => axiosInstance.post("/exams", data);

export const getExamDetail = (examId) => axiosInstance.get(`/exams/${examId}`);

export const deleteExam = (examId) => axiosInstance.delete(`/exams/${examId}`);
export const updateExam = (examId, data) => axiosInstance.put(`/exams/${examId}`, data);

export const getQuestions = (examId) => axiosInstance.get(`/exams/${examId}/questions`);

export const addQuestion = (examId, data) => axiosInstance.post(`/exams/${examId}/questions`, data);

export const updateQuestion = (examId, questionId, data) => 
  axiosInstance.put(`/exams/${examId}/questions/${questionId}`, data);

export const deleteQuestion = (examId, questionId) => 
  axiosInstance.delete(`/exams/${examId}/questions/${questionId}`);

export const saveBatchQuestions = (examId, questions) => 
  axiosInstance.post(`/exams/${examId}/questions/batch`, questions);
