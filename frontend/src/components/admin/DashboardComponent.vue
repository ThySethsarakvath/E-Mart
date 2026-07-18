<template>
  <div class="dashboard">
    <section class="dashboard-intro">
      <div>
        <p class="section-kicker">Business overview</p>
        <h2>Store performance at a glance</h2>
        <p>Monitor catalog activity, customers, orders, and revenue from one workspace.</p>
      </div>
      <button class="refresh-button" :disabled="loading" @click="fetchDashboardData">
        <span :class="{ spinning: loading }">
          <AdminIcon name="refresh" />
        </span>
        Refresh data
      </button>
    </section>

    <div v-if="error" class="error-banner" role="alert">
      <span class="error-icon"><AdminIcon name="alert" /></span>
      <div>
        <strong>Dashboard data could not be loaded</strong>
        <p>{{ error }}</p>
      </div>
      <button @click="fetchDashboardData">Try again</button>
    </div>

    <section class="stats-grid" aria-label="Store statistics">
      <article v-for="card in statCards" :key="card.label" class="stat-card">
        <div class="stat-card-top">
          <span class="stat-icon" :class="card.tone">
            <AdminIcon :name="card.icon" />
          </span>
          <span class="stat-status">Live</span>
        </div>
        <div>
          <p class="stat-label">{{ card.label }}</p>
          <div v-if="loading" class="stat-skeleton" />
          <p v-else class="stat-number">{{ card.value }}</p>
          <p class="stat-caption">{{ card.caption }}</p>
        </div>
      </article>
    </section>

    <section class="panel quick-actions">
      <div class="panel-header">
        <div>
          <p class="section-kicker">Shortcuts</p>
          <h3>Quick actions</h3>
        </div>
        <span class="panel-hint">Common admin tasks</span>
      </div>

      <div class="action-grid">
        <router-link v-for="action in quickActions" :key="action.to" :to="action.to" class="action-card">
          <span class="action-icon"><AdminIcon :name="action.icon" /></span>
          <span class="action-copy">
            <strong>{{ action.label }}</strong>
            <small>{{ action.description }}</small>
          </span>
          <span class="action-arrow"><AdminIcon name="arrow" /></span>
        </router-link>
      </div>
    </section>

    <section class="analytics-grid">
      <article class="panel chart-card chart-card--wide">
        <div class="panel-header">
          <div>
            <p class="section-kicker">Analytics</p>
            <h3>Sales overview</h3>
          </div>
          <span class="period-chip">Last 7 days</span>
        </div>
        <div class="chart-wrap chart-wrap--bar">
          <canvas ref="salesChart"></canvas>
        </div>
      </article>

      <article class="panel chart-card">
        <div class="panel-header">
          <div>
            <p class="section-kicker">Revenue</p>
            <h3>Distribution</h3>
          </div>
        </div>
        <div class="chart-wrap chart-wrap--donut">
          <canvas ref="revenueChart"></canvas>
        </div>
      </article>
    </section>

    <section class="panel recent-activity">
      <div class="panel-header">
        <div>
          <p class="section-kicker">Updates</p>
          <h3>Recent activity</h3>
        </div>
        <span class="panel-hint">Latest store events</span>
      </div>

      <div class="activity-list">
        <div v-for="activity in activities" :key="activity.text" class="activity-item">
          <span class="activity-icon" :class="activity.tone">
            <AdminIcon :name="activity.icon" />
          </span>
          <div class="activity-content">
            <p>{{ activity.text }}</p>
            <span>{{ activity.time }}</span>
          </div>
          <span class="activity-state">Completed</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import AdminIcon from '@/components/admin/AdminIcon.vue'
import orderService from '@/service/orders.service'
import userService from '@/service/user.service'
import productService from '@/service/product.service'

const loading = ref(true)
const error = ref(null)
const stats = ref({
  products: 0,
  totalOrders: 0,
  users: 0,
  totalRevenue: 0,
})

const salesChart = ref(null)
const revenueChart = ref(null)
let salesChartInstance = null
let revenueChartInstance = null

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value || 0)

const statCards = computed(() => [
  {
    label: 'Total products',
    value: stats.value.products.toLocaleString(),
    caption: 'Items in your catalog',
    icon: 'package',
    tone: 'blue',
  },
  {
    label: 'Total orders',
    value: stats.value.totalOrders.toLocaleString(),
    caption: 'Orders across all statuses',
    icon: 'orders',
    tone: 'indigo',
  },
  {
    label: 'Registered users',
    value: stats.value.users.toLocaleString(),
    caption: 'Customer accounts',
    icon: 'users',
    tone: 'violet',
  },
  {
    label: 'Total revenue',
    value: formatCurrency(stats.value.totalRevenue),
    caption: 'Recorded paid order value',
    icon: 'dollar',
    tone: 'emerald',
  },
])

const quickActions = [
  {
    to: '/admin/products',
    label: 'Manage products',
    description: 'Add or update catalog items',
    icon: 'package',
  },
  {
    to: '/admin/categories',
    label: 'Manage categories',
    description: 'Organize product collections',
    icon: 'tags',
  },
  {
    to: '/admin/orders',
    label: 'Review orders',
    description: 'Track fulfillment and payment',
    icon: 'clipboard',
  },
  {
    to: '/admin/users',
    label: 'Manage users',
    description: 'Review customer accounts',
    icon: 'user-plus',
  },
]

const activities = [
  { text: 'New order placed', time: '2 minutes ago', icon: 'check', tone: 'emerald' },
  { text: 'Product added to inventory', time: '15 minutes ago', icon: 'package', tone: 'blue' },
  { text: 'New user registered', time: '1 hour ago', icon: 'user-plus', tone: 'violet' },
]

const loadChartLibrary = () => {
  if (window.Chart) return Promise.resolve()

  const existingScript = document.querySelector('[data-admin-chart]')
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', resolve, { once: true })
      existingScript.addEventListener('error', reject, { once: true })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
    script.dataset.adminChart = 'true'
    script.addEventListener('load', resolve, { once: true })
    script.addEventListener('error', reject, { once: true })
    document.head.appendChild(script)
  })
}

const initializeCharts = () => {
  if (!window.Chart || !salesChart.value || !revenueChart.value) return

  salesChartInstance?.destroy()
  revenueChartInstance?.destroy()

  salesChartInstance = new window.Chart(salesChart.value.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Sales',
          data: [12, 19, 15, 25, 22, 30, 28],
          backgroundColor: '#0d6efd',
          hoverBackgroundColor: '#0b5ed7',
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 34,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          border: { display: false },
          grid: { color: '#eef2f7' },
          ticks: { color: '#94a3b8', padding: 10 },
        },
        x: {
          border: { display: false },
          grid: { display: false },
          ticks: { color: '#64748b' },
        },
      },
    },
  })

  revenueChartInstance = new window.Chart(revenueChart.value.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Products', 'Services', 'Shipping'],
      datasets: [
        {
          data: [
            stats.value.totalRevenue * 0.7,
            stats.value.totalRevenue * 0.2,
            stats.value.totalRevenue * 0.1,
          ],
          backgroundColor: ['#0d6efd', '#14b8a6', '#cbd5e1'],
          hoverOffset: 4,
          borderWidth: 4,
          borderColor: '#fff',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 18,
            color: '#64748b',
            font: { size: 11, weight: 600 },
          },
        },
      },
    },
  })
}

const fetchDashboardData = async () => {
  loading.value = true
  error.value = null

  try {
    const orderStats = await orderService.getDashboardStats()
    stats.value.totalOrders = orderStats.totalOrders || 0
    stats.value.totalRevenue = orderStats.totalRevenue || 0

    try {
      const userList = await userService.getAllUsers()
      stats.value.users = Array.isArray(userList) ? userList.length : 0
    } catch (userError) {
      console.warn('Failed to fetch users:', userError)
      stats.value.users = 0
    }

    try {
      const productData = await productService.getAllProducts(1, 1)
      stats.value.products = productData.pagination?.total || productData.length || 0
    } catch (productError) {
      console.warn('Failed to fetch products:', productError)
      stats.value.products = 0
    }

    await nextTick()
    initializeCharts()
  } catch (dashboardError) {
    console.error('Dashboard load failed:', dashboardError)
    error.value = dashboardError.message || 'Failed to load dashboard data'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    await loadChartLibrary()
  } catch (chartError) {
    console.warn('Chart library could not be loaded:', chartError)
  }
  await fetchDashboardData()
})

onUnmounted(() => {
  salesChartInstance?.destroy()
  revenueChartInstance?.destroy()
})
</script>

<style scoped>
.dashboard {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  color: #0f172a;
}

.dashboard-intro {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.section-kicker {
  margin: 0 0 5px;
  color: var(--admin-primary, #0d6efd);
  font-size: 0.68rem;
  font-weight: 750;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.dashboard-intro h2 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.45rem, 2vw, 1.85rem);
  font-weight: 760;
  letter-spacing: -0.035em;
}

.dashboard-intro p:last-child {
  max-width: 650px;
  margin: 7px 0 0;
  color: #64748b;
  font-size: 0.88rem;
}

.refresh-button {
  display: inline-flex;
  height: 40px;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
  border: 1px solid #dbe3ee;
  border-radius: 10px;
  padding: 0 14px;
  background: #fff;
  color: #334155;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 700;
}

.refresh-button:hover:not(:disabled) {
  border-color: var(--admin-primary-border, #b6d4fe);
  color: var(--admin-primary-dark, #0b5ed7);
}

.refresh-button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.refresh-button span {
  font-size: 0.95rem;
}

.refresh-button .spinning {
  animation: rotate 900ms linear infinite;
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

.error-banner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  border: 1px solid #fecdd3;
  border-radius: 12px;
  padding: 14px 16px;
  background: #fff1f2;
  color: #9f1239;
}

.error-icon {
  font-size: 1.25rem;
}

.error-banner strong {
  font-size: 0.85rem;
  font-weight: 750;
}

.error-banner p {
  margin: 2px 0 0;
  font-size: 0.78rem;
}

.error-banner button {
  border: 0;
  border-radius: 8px;
  padding: 8px 12px;
  background: #be123c;
  color: #fff;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 700;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card,
.panel {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.025);
}

.stat-card {
  min-height: 174px;
  padding: 18px;
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.stat-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  transform: translateY(-2px);
}

.stat-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.stat-icon,
.action-icon,
.activity-icon {
  display: grid;
  place-items: center;
}

.stat-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  font-size: 1.05rem;
}

.blue {
  background: var(--admin-primary-soft, #e7f1ff);
  color: var(--admin-primary, #0d6efd);
}

.indigo {
  background: #eef2ff;
  color: #4f46e5;
}

.violet {
  background: #f5f3ff;
  color: #7c3aed;
}

.emerald {
  background: #ecfdf5;
  color: #059669;
}

.stat-status {
  border-radius: 999px;
  padding: 4px 8px;
  background: #f0fdf4;
  color: #15803d;
  font-size: 0.62rem;
  font-weight: 750;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.stat-label {
  margin: 0 0 6px;
  color: #64748b;
  font-size: 0.77rem;
  font-weight: 650;
}

.stat-number {
  margin: 0;
  color: #0f172a;
  font-size: 1.75rem;
  font-weight: 780;
  letter-spacing: -0.04em;
  line-height: 1.15;
}

.stat-caption {
  margin: 7px 0 0;
  color: #94a3b8;
  font-size: 0.69rem;
}

.stat-skeleton {
  width: 58%;
  height: 32px;
  border-radius: 7px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}

.panel {
  padding: 20px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.panel-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 750;
  letter-spacing: -0.02em;
}

.panel-hint {
  color: #94a3b8;
  font-size: 0.7rem;
  font-weight: 600;
}

.quick-actions {
  margin-bottom: 20px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.action-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 11px;
  min-width: 0;
  border: 1px solid #edf0f5;
  border-radius: 11px;
  padding: 13px;
  color: #334155;
  transition: border-color 160ms ease, background 160ms ease, transform 160ms ease;
}

.action-card:hover {
  border-color: var(--admin-primary-border, #b6d4fe);
  background: #f8fbff;
  transform: translateY(-1px);
}

.action-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--admin-primary-soft, #e7f1ff);
  color: var(--admin-primary, #0d6efd);
  font-size: 0.95rem;
}

.action-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.action-copy strong {
  overflow: hidden;
  color: #1e293b;
  font-size: 0.76rem;
  font-weight: 720;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-copy small {
  overflow: hidden;
  margin-top: 2px;
  color: #94a3b8;
  font-size: 0.64rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-arrow {
  color: #94a3b8;
  font-size: 0.9rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.75fr) minmax(280px, 0.75fr);
  gap: 20px;
  margin-bottom: 20px;
}

.period-chip {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 9px;
  color: #64748b;
  font-size: 0.67rem;
  font-weight: 650;
}

.chart-wrap {
  position: relative;
  width: 100%;
}

.chart-wrap--bar {
  height: 280px;
}

.chart-wrap--donut {
  height: 280px;
}

.activity-list {
  display: flex;
  flex-direction: column;
}

.activity-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 13px;
  min-height: 62px;
  border-top: 1px solid #f1f5f9;
}

.activity-item:first-child {
  border-top: 0;
}

.activity-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  font-size: 0.95rem;
}

.activity-content p {
  margin: 0;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 680;
}

.activity-content span {
  display: block;
  margin-top: 2px;
  color: #94a3b8;
  font-size: 0.66rem;
}

.activity-state {
  border-radius: 999px;
  padding: 4px 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.62rem;
  font-weight: 650;
}

@media (max-width: 1180px) {
  .stats-grid,
  .action-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .dashboard-intro {
    align-items: flex-start;
    flex-direction: column;
  }

  .refresh-button {
    width: 100%;
    justify-content: center;
  }

  .stats-grid,
  .action-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    min-height: 156px;
  }

  .panel {
    padding: 16px;
  }

  .panel-hint,
  .activity-state {
    display: none;
  }

  .error-banner {
    grid-template-columns: auto 1fr;
  }

  .error-banner button {
    grid-column: 1 / -1;
  }
}
</style>
