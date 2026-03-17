import axiosInstance from "./axiosInstance";

export const analyzeContent = (data) => axiosInstance.post("/ai/analyze", data);

export const generateQuestions = (data) => axiosInstance.post("/ai/generate", data);
