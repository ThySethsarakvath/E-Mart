<template>
  <div class="dashboard">
    <div class="dashboard-container">
      <!-- Error Banner -->
      <div v-if="error" class="error-banner">
        <span>⚠️ {{ error }}</span>
        <button @click="fetchDashboardData" class="retry-btn">Retry</button>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon products">📦</div>
          <div class="stat-info">
            <h3>Total Products</h3>
            <p class="stat-number">{{ loading ? '...' : stats.products }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon orders">🛒</div>
          <div class="stat-info">
            <h3>Total Orders</h3>
            <p class="stat-number">{{ loading ? '...' : stats.totalOrders }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon users">👥</div>
          <div class="stat-info">
            <h3>Total Users</h3>
            <p class="stat-number">{{ loading ? '...' : stats.users }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon revenue">💰</div>
          <div class="stat-info">
            <h3>Revenue</h3>
            <p class="stat-number">{{ loading ? '...' : formatCurrency(stats.totalRevenue) }}</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="action-grid">
          <router-link to="/admin/products" class="action-btn">
            <span class="action-icon">📦</span>
            <span>Add New Product</span>
          </router-link>
          <router-link to="/admin/categories" class="action-btn">
            <span class="action-icon">🏷️</span>
            <span>Manage Categories</span>
          </router-link>
          <router-link to="/admin/orders" class="action-btn">
            <span class="action-icon">📋</span>
            <span>View Orders</span>
          </router-link>
          <router-link to="/admin/users" class="action-btn">
            <span class="action-icon">👥</span>
            <span>Manage Users</span>
          </router-link>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-card large">
          <h3 class="chart-title">Sales Overview</h3>
          <canvas ref="salesChart"></canvas>
        </div>

        <div class="chart-card">
          <h3 class="chart-title">Revenue Distribution</h3>
          <canvas ref="revenueChart"></canvas>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity">
        <h3 class="section-title">Recent Activity</h3>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon success">✓</div>
            <div class="activity-content">
              <p class="activity-text">New order placed</p>
              <span class="activity-time">2 minutes ago</span>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon info">📦</div>
            <div class="activity-content">
              <p class="activity-text">Product added to inventory</p>
              <span class="activity-time">15 minutes ago</span>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon warning">👤</div>
            <div class="activity-content">
              <p class="activity-text">New user registered</p>
              <span class="activity-time">1 hour ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
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

const salesChart = ref(null);
const revenueChart = ref(null);

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
};

const fetchDashboardData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const orderStats = await orderService.getDashboardStats();
    stats.value.totalOrders = orderStats.totalOrders || 0;
    stats.value.totalRevenue = orderStats.totalRevenue || 0;

    try {
      const userList = await userService.getAllUsers();
      stats.value.users = Array.isArray(userList) ? userList.length : 0;
    } catch (err) {
      console.warn('Failed to fetch users:', err);
      stats.value.users = 0;
    }

    try {
      const productData = await productService.getAllProducts(1, 1);
      stats.value.products = productData.pagination?.total || productData.length || 0;
    } catch (err) {
      console.warn('Failed to fetch products:', err);
      stats.value.products = 0;
    }

    await nextTick();
    initializeCharts();

  } catch (err) {
    console.error("Dashboard load failed:", err);
    error.value = err.message || 'Failed to load dashboard data';
  } finally {
    loading.value = false;
  }
};

const initializeCharts = () => {
  if (!salesChart.value || !revenueChart.value) return;

  // Sales Chart (Bar)
  const salesCtx = salesChart.value.getContext('2d');
  new window.Chart(salesCtx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Sales',
        data: [12, 19, 15, 25, 22, 30, 28],
        backgroundColor: 'rgba(9, 144, 255, 0.8)',
        borderColor: '#0990ff',
        borderWidth: 2,
        borderRadius: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0, 0, 0, 0.05)' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });

  // Revenue Chart (Doughnut)
  const revenueCtx = revenueChart.value.getContext('2d');
  new window.Chart(revenueCtx, {
    type: 'doughnut',
    data: {
      labels: ['Products', 'Services', 'Shipping'],
      datasets: [{
        data: [stats.value.totalRevenue * 0.7, stats.value.totalRevenue * 0.2, stats.value.totalRevenue * 0.1],
        backgroundColor: [
          '#0990ff',
          '#06d6a0',
          '#ffd60a'
        ],
        borderWidth: 3,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: { size: 12 }
          }
        }
      }
    }
  });
};

onMounted(async () => {
  // Load Chart.js from CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
  script.onload = () => {
    fetchDashboardData();
  };
  document.head.appendChild(script);
});
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  padding: 2rem;
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Error Banner */
.error-banner {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.retry-btn {
  background: white;
  color: #ff6b6b;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: white;
  padding: 1.75rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(9, 144, 255, 0.1);
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(9, 144, 255, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.stat-icon.products { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.orders { background: linear-gradient(135deg, #0990ff 0%, #0077ee 100%); }
.stat-icon.users { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.revenue { background: linear-gradient(135deg, #ffd60a 0%, #ffc107 100%); }

.stat-info h3 {
  margin: 0 0 0.5rem 0;
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-number {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #212529;
  line-height: 1;
}

/* Quick Actions */
.quick-actions {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2.5rem;
}

.quick-actions h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  color: #212529;
  font-weight: 700;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.action-btn {
  background: linear-gradient(135deg, #0990ff 0%, #0077ee 100%);
  color: white;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 4px 15px rgba(9, 144, 255, 0.3);
}

.action-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(9, 144, 255, 0.4);
  background: linear-gradient(135deg, #0077ee 0%, #0066dd 100%);
}

.action-icon {
  font-size: 1.5rem;
}

/* Charts Section */
.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.chart-card {
  background: white;
  padding: 1.75rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.chart-card.large {
  grid-column: 1;
}

.chart-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #212529;
}

canvas {
  max-height: 300px;
}

/* Recent Activity */
.recent-activity {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  color: #212529;
  font-weight: 700;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 10px;
  transition: background 0.2s ease;
}

.activity-item:hover {
  background: #f8f9fa;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.activity-icon.success { background: linear-gradient(135deg, #06d6a0 0%, #1dd1a1 100%); }
.activity-icon.info { background: linear-gradient(135deg, #0990ff 0%, #0077ee 100%); }
.activity-icon.warning { background: linear-gradient(135deg, #ffd60a 0%, #ffc107 100%); }

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0 0 0.25rem 0;
  font-weight: 500;
  color: #212529;
}

.activity-time {
  font-size: 0.8125rem;
  color: #6c757d;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .charts-section {
    grid-template-columns: 1fr;
  }

  .chart-card.large {
    grid-column: auto;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .stat-card {
    padding: 1.25rem;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }
}
</style>
