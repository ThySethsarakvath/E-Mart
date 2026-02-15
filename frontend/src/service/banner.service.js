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
    if (!imagePath) return 'https://via.placeholder.com/1920x600?text=No+Image';
    // If it's already a full URL (Cloudinary), return as-is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Legacy support: if it's still a local path (shouldn't happen after migration)
    return imagePath;
  },
};
