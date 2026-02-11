import apiClient from './api';

export default {
  async getAllProducts() {
    try {
      const response = await apiClient.get('/products');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async createProduct(formData) {
    try {
      const response = await apiClient.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async updateProduct(id, formData) {
    try {
      // NestJS Patch with FileInterceptor
      const response = await apiClient.patch(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async deleteProduct(id) {
    try {
      const response = await apiClient.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Helper to fetch categories for the dropdowns
  async getCategories() {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  getProductImageUrl(imagePath) {
    // Points to the microservice storage port via gateway or direct
    return `http://localhost:4000/uploads/products/${imagePath}`;
  }
};
