import apiClient from './api';

export default {

  // ======================
  // GET ALL PROMOTIONS
  // ======================
  async getAllPromotions() {
    try {
      const response = await apiClient.get('/promotions');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ======================
  // CREATE PROMOTION
  // ======================
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

  // ======================
  // UPDATE PROMOTION
  // ======================
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

  // ======================
  // DELETE PROMOTION
  // ======================
  async deletePromotion(id) {
    try {
      const response = await apiClient.delete(`/promotions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ======================
  // IMAGE URL HELPER
  // ======================
  getPromotionImageUrl(imagePath) {
    return `http://localhost:4000/uploads/promotions/${imagePath}`;
  },
};
