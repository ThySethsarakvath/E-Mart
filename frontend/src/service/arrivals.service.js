import apiClient from './api';
import axios from 'axios';

const DIRECT_ORDER_WORKER_URL = 'http://localhost:4000';

export default {
  async getAllArrivals() {
    try {
      const response = await apiClient.get('/arrivals');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async createArrival(formData) {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(`${DIRECT_ORDER_WORKER_URL}/arrivals`, formData, {
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

  async updateArrival(id, formData) {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.patch(`${DIRECT_ORDER_WORKER_URL}/arrivals/${id}`, formData, {
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

  async deleteArrival(id) {
    try {
      const response = await apiClient.delete(`/arrivals/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getArrivalImageUrl(imagePath) {
    return `${DIRECT_ORDER_WORKER_URL}/uploads/arrivals/${imagePath}`;
  },
};
