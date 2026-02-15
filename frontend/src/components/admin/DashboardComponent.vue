<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div v-if="error" class="error-banner">
        ⚠️ {{ error }}
        <button @click="fetchDashboardData">Retry</button>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-info">
          <h3>Total Products</h3>
          <p class="stat-number">{{ loading ? '...' : stats.products }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🛒</div>
        <div class="stat-info">
          <h3>Total Orders</h3>
          <p class="stat-number">{{ loading ? '...' : stats.totalOrders }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <h3>Total Users</h3>
          <p class="stat-number">{{ loading ? '...' : stats.users }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <h3>Revenue</h3>
          <p class="stat-number">{{ loading ? '...' : formatCurrency(stats.totalRevenue) }}</p>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="action-grid">
        <router-link to="/admin/products" class="action-btn">Add New Product</router-link>
        <router-link to="/admin/categories" class="action-btn">Manage Categories</router-link>
        <router-link to="/admin/orders" class="action-btn">View Orders</router-link>
        <router-link to="/admin/users" class="action-btn">Manage Users</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import orderService from '@/service/orders.service';
import userService from '@/service/user.service';
import productService from '@/service/product.service';

const loading = ref(true);
const error = ref(null);
const stats = ref({
  products: 0,
  totalOrders: 0,
  users: 0,
  totalRevenue: 0
});

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
};

const fetchDashboardData = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Fetch order stats
    const orderStats = await orderService.getDashboardStats();
    stats.value.totalOrders = orderStats.totalOrders || 0;
    stats.value.totalRevenue = orderStats.totalRevenue || 0;

    // Fetch users count
    try {
      const userList = await userService.getAllUsers();
      stats.value.users = Array.isArray(userList) ? userList.length : 0;
    } catch (err) {
      console.warn('Failed to fetch users:', err);
      stats.value.users = 0;
    }

    // Fetch products count
    try {
      const productData = await productService.getAllProducts(1, 1);
      stats.value.products = productData.pagination?.total || productData.length || 0;
    } catch (err) {
      console.warn('Failed to fetch products:', err);
      stats.value.products = 0;
    }

  } catch (err) {
    console.error("Dashboard load failed:", err);
    error.value = err.message || 'Failed to load dashboard data';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDashboardData);
</script>

<style scoped>
.error-banner {
  background: #fee;
  color: #c33;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-banner button {
  background: #c33;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.error-banner button:hover {
  background: #a22;
}
.dashboard {
  max-width: 1400px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 40px;
}

.stat-info h3 {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.stat-number {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.quick-actions h2 {
  margin-bottom: 20px;
  font-size: 20px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.action-btn {
  background: #0990ff;
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  text-decoration: none;
  text-align: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #0077ee;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(9, 144, 255, 0.3);
}
</style>
