import { axiosInstance } from '../axios';

export const userApi = {
  getUsers: async () => {
    const response = await axiosInstance.get('/users');
    return response.data;
  },

  inviteUser: async (userData) => {
    const response = await axiosInstance.post('/users/invite', userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  },

  toggleUserStatus: async (id) => {
    const response = await axiosInstance.put(`/users/${id}/toggle-status`);
    return response.data;
  },

  getInviteDetails: async (token) => {
    const response = await axiosInstance.get(`/users/invite/${token}`);
    return response.data;
  },

  completeProfile: async (profileData) => {
    const response = await axiosInstance.post('/users/complete-profile', profileData);
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await axiosInstance.put('/users/profile', userData);
    return response.data;
  },
};

