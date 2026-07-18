import apiClient from './api'

export default {
  async getAllArrivals() {
    try {
      const response = await apiClient.get('/arrivals')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  async createArrival(formData) {
    try {
      const response = await apiClient.post('/arrivals', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  async updateArrival(id, formData) {
    try {
      const response = await apiClient.patch(`/arrivals/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  async deleteArrival(id) {
    try {
      const response = await apiClient.delete(`/arrivals/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getArrivalImageUrl(imagePath) {
    if (!imagePath) return 'https://via.placeholder.com/500x500?text=No+Image'
    if (imagePath.startsWith('http')) return imagePath
    return imagePath
  },
}
