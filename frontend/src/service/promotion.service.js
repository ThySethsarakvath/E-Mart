import apiClient from './api';

export default {

  async getAllPromotions() {
    try {
      const response = await apiClient.get('/promotions');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async createPromotion(formData) {
    try {
      const response = await apiClient.post('/promotions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async updatePromotion(id, formData) {
    try {
      const response = await apiClient.patch(`/promotions/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async deletePromotion(id) {
    try {
      const response = await apiClient.delete(`/promotions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPromotionImageUrl(imagePath) {
    if (!imagePath) return 'https://via.placeholder.com/400x400?text=No+Image';
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return imagePath;
  },
};
