import { axiosInstance } from '../axios';

export const browserApi = {
  // Record user web search activity
  recordSearchActivity: async (activityData) => {
    const response = await axiosInstance.post('/browser/search-activity', activityData);
    return response.data;
  },

  // Get search activity list with filters and telemetry stats
  getSearchActivities: async (params = {}) => {
    const response = await axiosInstance.get('/browser/search-activity', { params });
    return response.data;
  },

  // Delete a specific search activity record
  deleteSearchActivity: async (id) => {
    const response = await axiosInstance.delete(`/browser/search-activity/${id}`);
    return response.data;
  },

  // Clear search activity history
  clearSearchActivities: async (clearAll = false) => {
    const response = await axiosInstance.delete('/browser/search-activity', {
      params: { clearAll },
    });
    return response.data;
  },

  // Get rich metadata for URL preview
  getUrlPreviewMeta: async (url) => {
    const response = await axiosInstance.get('/browser/preview-meta', {
      params: { url },
    });
    return response.data;
  },

  // Helper to generate full proxy URL for iframe embedding
  getProxyUrl: (targetUrl) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
    return `${baseUrl}/browser/proxy?url=${encodeURIComponent(targetUrl)}`;
  },
};

