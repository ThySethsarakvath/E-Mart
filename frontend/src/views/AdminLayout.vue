<template>
  <div class="admin-container">
    <aside class="sidebar">
      <div class="logo-section">
        <img src="../assets/logo.png" class="logo-img"/>
      </div>

      <nav class="nav-menu">
        <router-link to="/admin/dashboard" class="nav-item">
          <span class="icon">📊</span> Dashboard
        </router-link>
        <router-link to="/admin/products" class="nav-item">
          <span class="icon">📦</span> Products
        </router-link>
        <router-link to="/admin/categories" class="nav-item">
          <span class="icon">🏷️</span> Categories
        </router-link>
        <router-link to="/admin/banners" class="nav-item">
          <span class="icon">🖼️</span> Banners
        </router-link>
        <router-link to="/admin/arrivals" class="nav-item">
          <span class="icon">✨</span> New Arrivals
        </router-link>
        <router-link to="/admin/promotions" class="nav-item">
          <span class="icon">🎁</span> Promotions
        </router-link>
        <router-link to="/admin/orders" class="nav-item">
          <span class="icon">🛒</span> Orders
        </router-link>
        <router-link to="/admin/users" class="nav-item">
          <span class="icon">👥</span> Users
        </router-link>
      </nav>

      <!-- Admin Account Section -->
      <div class="sidebar-footer">
        <div class="admin-avatar">
          {{ getInitials(user?.firstName, user?.lastName) }}
        </div>
        <div class="admin-meta">
          <p class="name">{{ user?.firstName }} {{ user?.lastName }}</p>
          <p class="role">Administrator</p>
        </div>
        <button @click="handleLogout" class="logout-btn" title="Logout">
          🚪
        </button>
      </div>
    </aside>

    <main class="main-content">
      <div class="content-header">
        <h1>{{ pageTitle }}</h1>
        <div class="header-actions">
          <button @click="goToHome" class="btn-secondary">
            🏠 Back to Store
          </button>
        </div>
      </div>
      <router-view />
    </main>
  </div>
</template>

<script>
import authService from '@/auth/auth.service';

export default {
  name: 'AdminLayout',
  data() {
    return {
      user: null
    }
  },
  computed: {
    pageTitle() {
      const routeName = this.$route.name || '';
      const titles = {
        'admin-dashboard': 'Dashboard',
        'admin-products': 'Product Management',
        'admin-categories': 'Category Management',
        'admin-banners': 'Banner Management',
        'admin-arrivals': 'New Arrivals',
        'admin-promotions': 'Promotions',
        'admin-orders': 'Order Management',
        'admin-users': 'User Management',
      };
      return titles[routeName] || 'Admin Panel';
    }
  },
  mounted() {
    this.user = authService.getCurrentUser();

    // Redirect if not admin
    if (!authService.isAdmin()) {
      this.$router.push('/');
    }
  },
  methods: {
    getInitials(firstName, lastName) {
      const first = firstName?.charAt(0) || '';
      const last = lastName?.charAt(0) || '';
      return (first + last).toUpperCase() || 'AD';
    },
    async handleLogout() {
      await authService.logout();
      this.$router.push('/login');
    },
    goToHome() {
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.admin-container {
  display: flex;
  height: 100vh;
  background-color: #e7e7e7;
}

.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.logo-section {
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #eee;
}

.logo-img {
  width: 140px;
  height: auto;
  display: block;
}

.nav-menu {
  flex: 1;
  padding: 20px 15px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  text-decoration: none;
  color: #666;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s;
  font-size: 15px;
}

.icon {
  margin-right: 12px;
  font-size: 18px;
}

.nav-item:hover {
  background-color: #f0f2ff;
  color: #0990ff;
}

.nav-item.router-link-active {
  background-color: #0990ff;
  color: white;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-avatar {
  width: 40px;
  height: 40px;
  background: #0990ff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.admin-meta {
  flex: 1;
}

.admin-meta p {
  margin: 0;
}

.admin-meta .name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
}

.admin-meta .role {
  font-size: 0.75rem;
  color: #888;
}

.logout-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.logout-btn:hover {
  background-color: #fee;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  padding: 30px 40px;
  overflow-y: auto;
  height: 100vh;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.content-header h1 {
  font-size: 28px;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-secondary {
  background: white;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #f8f9fa;
  border-color: #0990ff;
  color: #0990ff;
}

@media (max-width: 968px) {
  .sidebar {
    width: 70px;
  }

  .logo-section {
    padding: 20px 10px;
  }

  .logo-img {
    width: 50px;
  }

  .nav-item {
    justify-content: center;
    padding: 12px 10px;
  }

  .nav-item span:not(.icon) {
    display: none;
  }

  .icon {
    margin-right: 0;
  }

  .sidebar-footer {
    flex-direction: column;
    gap: 8px;
  }

  .admin-meta {
    display: none;
  }

  .main-content {
    margin-left: 70px;
  }
}
</style>
