import apiClient from '../service/api';

export default {
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', {
        email: userData.email,
        password: userData.password,
        firstName: userData.name.split(' ')[0] || userData.name,
        lastName: userData.name.split(' ').slice(1).join(' ') || '',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const { user, accessToken, refreshToken } = response.data;

      // Store tokens and user info
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  async getProfile() {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  },

  hasRole(role) {
  const user = this.getCurrentUser();
  return user?.roles?.includes(role) || false;
},

hasPermission(permission) {
  const user = this.getCurrentUser();
  return user?.permissions?.includes(permission) || false;
},

hasAnyRole(roles) {
  const user = this.getCurrentUser();
  return roles.some(role => user?.roles?.includes(role)) || false;
},

hasAllPermissions(permissions) {
  const user = this.getCurrentUser();
  return permissions.every(permission => user?.permissions?.includes(permission)) || false;
},

isAdmin() {
  return this.hasRole('admin');
},
};
