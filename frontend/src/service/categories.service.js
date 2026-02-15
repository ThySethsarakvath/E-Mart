import apiClient from './api';
import axios from 'axios';

export default {
  // Categories
  async getAllCategories() {
    try {
      const response = await apiClient.get('/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getCategory(id) {
    try {
      const response = await apiClient.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async createCategory(formData) {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiClient.post(`/categories`, formData, {
        headers: {
          // 'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async updateCategory(id, formData) {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiClient.patch(`/categories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async deleteCategory(id) {
    try {
      const response = await apiClient.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCategoryImageUrl(imagePath) {
  if (!imagePath) return 'https://via.placeholder.com/300x300?text=Category';
  if (imagePath.startsWith('http')) return imagePath;
  return imagePath;
  },

  // Subcategories
  async getAllSubcategories() {
    try {
      const response = await apiClient.get('/categories/subcategories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async createSubcategory(name, categoryId) {
    try {
      const response = await apiClient.post('/categories/subcategories', {
        name,
        categoryId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async deleteSubcategory(id) {
    try {
      const response = await apiClient.delete(`/categories/subcategories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
