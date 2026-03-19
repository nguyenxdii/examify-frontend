import axiosInstance from "./axiosInstance";

export const createRoom = (data) => axiosInstance.post("/rooms", data);

export const getMyRooms = () => axiosInstance.get("/rooms");

export const getRoomDetail = (roomId) => axiosInstance.get(`/rooms/${roomId}`);

export const updateRoom = (roomId, data) => axiosInstance.put(`/rooms/${roomId}`, data);

export const deleteRoom = (roomId) => axiosInstance.delete(`/rooms/${roomId}`);

export const openRoom = (roomId) => axiosInstance.patch(`/rooms/${roomId}/open`);

export const closeRoom = (roomId) => axiosInstance.patch(`/rooms/${roomId}/close`);

export const uploadStudentList = (roomId, formData) => 
  axiosInstance.post(`/rooms/${roomId}/students`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getStudentList = (roomId) => axiosInstance.get(`/rooms/${roomId}/students`);
 
export const addStudentManual = (roomId, data) => 
  axiosInstance.post(`/rooms/${roomId}/students/manual`, data);
 
export const deleteStudentManual = (roomId, id) => 
  axiosInstance.delete(`/rooms/${roomId}/students/${id}`);
 
export const getRoomSubmissions = (roomId) => axiosInstance.get(`/rooms/${roomId}/submissions`);

export const getSubmissionDetail = (roomId, submissionId) => 
  axiosInstance.get(`/rooms/${roomId}/submissions/${submissionId}`);

export const gradeEssay = (roomId, submissionId, data) => 
  axiosInstance.patch(`/rooms/${roomId}/submissions/${submissionId}/grade`, data);
