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

export const getQuestionBank = () => axiosInstance.get("/exams/questions/bank");

export const suggestTopic = (content) => axiosInstance.post("/ai/suggest-topic", { content });

export const analyzeRawQuestion = (rawText) => axiosInstance.post("/ai/analyze-raw-question", { rawText });
export const submitPublicQuiz = (examId, data) => axiosInstance.post(`/exams/${examId}/submit`, data);
export const saveToBank = (data) => axiosInstance.post("/exams/questions/bank", data);

// Room APIs
export const getRoomPublic = (roomId) => axiosInstance.get(`/rooms/${roomId}/public`);
export const submitRoomQuiz = (roomId, data) => axiosInstance.post(`/rooms/${roomId}/submit`, data);
export const validateRoom = (roomId, data) => axiosInstance.post(`/rooms/${roomId}/validate`, data);
