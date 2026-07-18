import apiClient from './api';

export default {
  async getAllUsers() {
    const response = await apiClient.get('/users');
    return response.data;
  },

  // service/user.service.js
  async getMyProfile() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
  async toggleUserStatus(id) {
    const response = await apiClient.patch(`/users/${id}/toggle-status`);
    return response.data;
  },

  async deleteUser(id) {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  }
};
