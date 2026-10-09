import { axiosInstance } from '../axios';

export const authApi = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },
  logout: async () => {
    // If backend has logout endpoint, call it here
    // const response = await axiosInstance.post('/auth/logout');
    // return response.data;
    return Promise.resolve();
  }
};
