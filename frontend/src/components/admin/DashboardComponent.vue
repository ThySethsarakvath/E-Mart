<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-info">
          <h3>Total Products</h3>
          <p class="stat-number">1,234</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🛒</div>
        <div class="stat-info">
          <h3>Total Orders</h3>
          <p class="stat-number">856</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <h3>Total Users</h3>
          <p class="stat-number">3,421</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <h3>Revenue</h3>
          <p class="stat-number">$45,678</p>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="action-grid">
        <router-link to="/admin/products" class="action-btn">
          Add New Product
        </router-link>
        <router-link to="/admin/categories" class="action-btn">
          Manage Categories
        </router-link>
        <router-link to="/admin/banners" class="action-btn">
          Update Banners
        </router-link>
        <router-link to="/admin/orders" class="action-btn">
          View Orders
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard'
}
</script>

<style scoped>
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
