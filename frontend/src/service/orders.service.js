import apiClient from './api'

export default {
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/orders/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error.response?.data || error.message;
    }
  },

  async getAllOrders(page = 1, limit = 50) {
    const response = await apiClient.get(`/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  async updateOrderStatus(orderId, status) {
    const response = await apiClient.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  async getOrderById(orderId) {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  async getMyOrders() {
    try {
      const response = await apiClient.get('/orders/my-orders');
      console.log("Orders received:", response.data);
      return response.data.orders || response.data;
    } catch (error) {
      console.error("Order Service Error:", error.response?.data || error.message);
      throw error;
    }
  },

  async deleteOrder(orderId) {
    const response = await apiClient.delete(`/orders/${orderId}`);
    return response.data;
  },
}
