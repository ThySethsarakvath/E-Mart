import apiClient from './api'; // Ensure the path to your api.js is correct

export default {
  // GET http://localhost:4001/api/users
  async getAllUsers() {
    const response = await apiClient.get('/users');
    return response.data;
  },

  // service/user.service.js
  async getMyProfile() {
  const response = await apiClient.get('/users/me');
  return response.data;
  },

  // PATCH http://localhost:4001/api/users/:id/toggle-status
  async toggleUserStatus(id) {
    const response = await apiClient.patch(`/users/${id}/toggle-status`);
    return response.data;
  },

  // DELETE http://localhost:4001/api/users/:id
  async deleteUser(id) {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  }
};
