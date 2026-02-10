import apiClient from './api';

export default {
  async getAllBanners() {
    try {
      const response = await apiClient.get('/banners');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async createBanner(formData) {
    try {
      const response = await apiClient.post('/banners', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async updateBanner(id, formData) {
    try {
      const response = await apiClient.patch(`/banners/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async deleteBanner(id) {
    try {
      const response = await apiClient.delete(`/banners/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getBannerImageUrl(imagePath) {
    // Adjust this URL based on your backend configuration
    return `http://localhost:4000/uploads/banners/${imagePath}`;
  },
};
