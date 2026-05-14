import axiosInstance from './axiosInstance';

export const getUsers = async () => {
  return await axiosInstance.get('/admin/users');
};

export const toggleUserLock = async (userId, reason) => {
  const url = reason 
    ? `/admin/users/${userId}/toggle-lock?reason=${encodeURIComponent(reason)}`
    : `/admin/users/${userId}/toggle-lock`;
  return await axiosInstance.patch(url);
};
export const getExams = async () => {
  return await axiosInstance.get('/admin/exams');
};

export const deleteExam = async (examId, reason) => {
  return await axiosInstance.delete(`/admin/exams/${examId}?reason=${encodeURIComponent(reason)}`);
};

export const getStats = async () => {
  return await axiosInstance.get('/admin/stats');
};

export const getExamDetail = async (examId) => {
  return await axiosInstance.get(`/admin/exams/${examId}`);
};

export const getUserDetail = async (userId) => {
  return await axiosInstance.get(`/admin/users/${userId}/detail`);
};
