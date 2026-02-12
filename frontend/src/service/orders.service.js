import axios from 'axios';

const API_URL = 'http://localhost:4001/api/orders';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return (user && user.token) ? { Authorization: `Bearer ${user.token}` } : {};
};

export default {
  // Matches @Get() findAll()
  async getAllOrders(page = 1, limit = 50) {
    const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`, {
      headers: getAuthHeader()
    });
    // Your backend returns { orders: [], pagination: {} }
    return response.data;
  },

  // Matches @Patch(':id/status') updateStatus()
  async updateOrderStatus(orderId, status) {
    const response = await axios.patch(`${API_URL}/${orderId}/status`, { status }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Matches @Get(':id') findOne()
  async getOrderById(orderId) {
    const response = await axios.get(`${API_URL}/${orderId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Matches @Delete(':id') remove()
  async deleteOrder(orderId) {
    const response = await axios.delete(`${API_URL}/${orderId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};
