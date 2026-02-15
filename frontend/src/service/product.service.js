import apiClient from './api'

export default {
  async getAllProducts() {
    try {
      const response = await apiClient.get('/products')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  async createProduct(formData) {
    try {
      const response = await apiClient.post('/products', formData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  async updateProduct(id, formData) {
    try {
      const response = await apiClient.patch(`/products/${id}`, formData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  async deleteProduct(id) {
    try {
      const response = await apiClient.delete(`/products/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Helper to fetch categories for the dropdowns
  async getCategories() {
    const response = await apiClient.get('/categories')
    return response.data
  },

  getProductImageUrl(imagePath) {
    if (!imagePath) return 'https://via.placeholder.com/400x400?text=No+Image'
    if (imagePath.startsWith('http')) return imagePath
    return imagePath
  },
}
