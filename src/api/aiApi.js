import axiosInstance from "./axiosInstance";

export const analyzeContent = (data) => axiosInstance.post("/ai/analyze", data);

export const validateContent = (data) => axiosInstance.post("/ai/validate", data);

export const analyzeFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosInstance.post("/ai/analyze-file", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const generateQuestions = (data) => axiosInstance.post("/ai/generate", data);

export const generateQuestionsV2 = (data) => axiosInstance.post("/ai/generate-v2", data);
