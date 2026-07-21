<script setup>
import { onMounted, ref } from 'vue'
import orderService from '@/service/orders.service'

const orders = ref([])
const loading = ref(true)
const errorMessage = ref('')
const expandedOrderId = ref(null)

const fetchOrders = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await orderService.getMyOrders()
    orders.value = response?.orders || (Array.isArray(response) ? response : [])
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    errorMessage.value = 'We could not load your orders. Please try again.'
  } finally {
    loading.value = false
  }
}

const toggleDetails = (orderId) => {
  expandedOrderId.value = expandedOrderId.value === orderId ? null : orderId
}

const displayOrderId = (order) => {
  const value = String(order.orderNumber || order.id || '')
  return value.length > 12 ? value.slice(0, 8).toUpperCase() : value.toUpperCase()
}

const formatDate = (date) => {
  if (!date) return 'Date unavailable'
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

const formatTime = (date) => {
  if (!date) return ''
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsedDate)
}

const getOrderTotal = (order) => Number(order.total ?? order.totalAmount ?? order.amount ?? 0)
const getItems = (order) => order.items || order.orderItems || []
const getItemName = (item) => item.name || item.productName || item.product?.name || 'Product'
const getItemImage = (item) => item.imagePath || item.product?.imagePath || ''
const getItemPrice = (item) => Number(item.price ?? item.unitPrice ?? item.product?.price ?? 0)
const getStatus = (order) => String(order.status || 'PENDING').toUpperCase()
const getStatusClass = (order) => getStatus(order).toLowerCase().replace(/\s+/g, '-')

onMounted(fetchOrders)
</script>

<template>
  <main class="my-orders-page">
    <div class="container">
      <header class="page-header">
        <div>
          <span class="eyebrow">Purchase activity</span>
          <h1>My Orders</h1>
          <p>Review your purchases and keep track of every order in one place.</p>
        </div>
        <button v-if="!loading" type="button" class="refresh-button" @click="fetchOrders">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 6v5h-5M4 18v-5h5"></path>
            <path d="M18.5 9a7 7 0 0 0-12-2L4 11M5.5 15a7 7 0 0 0 12 2l2.5-4"></path>
          </svg>
          Refresh
        </button>
      </header>

      <section v-if="loading" class="state-card">
        <div class="spinner" aria-hidden="true"></div>
        <h2>Loading your orders</h2>
        <p>This should only take a moment.</p>
      </section>

      <section v-else-if="errorMessage" class="state-card error-card">
        <div class="state-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M12 8v5M12 16h.01"></path>
          </svg>
        </div>
        <h2>Unable to load orders</h2>
        <p>{{ errorMessage }}</p>
        <button type="button" class="primary-button" @click="fetchOrders">Try again</button>
      </section>

      <section v-else-if="orders.length === 0" class="state-card empty-card">
        <div class="state-icon package-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m3 7 9 5 9-5M12 12v9"></path>
            <path d="m5 5 7-3 7 3 2 2v10l-9 5-9-5V7l2-2Z"></path>
          </svg>
        </div>
        <span class="empty-label">Nothing here yet</span>
        <h2>Your order history is empty</h2>
        <p>When you complete your first purchase, its status and details will appear here.</p>
        <div class="state-actions">
          <RouterLink to="/products" class="primary-button">Explore products</RouterLink>
          <RouterLink to="/wishlist" class="secondary-button">View wishlist</RouterLink>
        </div>
      </section>

      <section v-else class="orders-list">
        <article v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-topline">
            <div class="order-identity">
              <span class="order-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m3 7 9 5 9-5M12 12v9"></path>
                  <path d="m5 5 7-3 7 3 2 2v10l-9 5-9-5V7l2-2Z"></path>
                </svg>
              </span>
              <div>
                <span class="order-label">Order</span>
                <h2>#{{ displayOrderId(order) }}</h2>
              </div>
            </div>
            <span :class="['status-pill', getStatusClass(order)]">
              <span class="status-dot"></span>
              {{ getStatus(order) }}
            </span>
          </div>

          <div class="order-overview">
            <div class="overview-item">
              <span>Placed on</span>
              <strong>{{ formatDate(order.createdAt) }}</strong>
              <small>{{ formatTime(order.createdAt) }}</small>
            </div>
            <div class="overview-item">
              <span>Items</span>
              <strong>{{ getItems(order).length || '—' }}</strong>
              <small>{{ getItems(order).length === 1 ? 'product' : 'products' }}</small>
            </div>
            <div class="overview-item">
              <span>Payment</span>
              <strong>{{ order.paymentMethod || 'ABA KHQR' }}</strong>
              <small>{{ order.paymentStatus || getStatus(order) }}</small>
            </div>
            <div class="overview-item total-item">
              <span>Order total</span>
              <strong>${{ getOrderTotal(order).toFixed(2) }}</strong>
              <small>Including applicable tax</small>
            </div>
          </div>

          <div v-if="expandedOrderId === order.id" class="order-details">
            <div class="detail-heading">
              <div>
                <h3>Order details</h3>
                <p>A summary of the products in this purchase.</p>
              </div>
            </div>

            <div v-if="getItems(order).length" class="item-list">
              <div v-for="(item, index) in getItems(order)" :key="item.id || index" class="order-item">
                <span class="item-image">
                  <img v-if="getItemImage(item)" :src="getItemImage(item)" :alt="getItemName(item)" />
                  <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m3 7 9 5 9-5M12 12v9"></path>
                    <path d="m5 5 7-3 7 3 2 2v10l-9 5-9-5V7l2-2Z"></path>
                  </svg>
                </span>
                <span class="item-copy">
                  <strong>{{ getItemName(item) }}</strong>
                  <small>Quantity: {{ item.quantity || 1 }}</small>
                </span>
                <span class="item-total">
                  ${{ (getItemPrice(item) * Number(item.quantity || 1)).toFixed(2) }}
                </span>
              </div>
            </div>
            <p v-else class="no-item-details">
              Product-level details are not available for this order.
            </p>
          </div>

          <div class="card-actions">
            <span class="support-copy">Need help? Contact our support team.</span>
            <button type="button" class="details-button" @click="toggleDetails(order.id)">
              {{ expandedOrderId === order.id ? 'Hide details' : 'View details' }}
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                :class="{ rotated: expandedOrderId === order.id }"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </button>
          </div>
        </article>
      </section>
    </div>
  </main>
</template>

<style scoped>
.my-orders-page {
  min-height: 70vh;
  padding: 56px 0 80px;
  background: #f7f9fc;
  color: #1e293b;
}

.container {
  max-width: 1050px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 30px;
}

.eyebrow,
.empty-label {
  display: inline-block;
  margin-bottom: 7px;
  color: #0d6efd;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.page-header h1 {
  margin: 0;
  color: #172033;
  font-size: clamp(32px, 4vw, 44px);
  letter-spacing: -0.04em;
}

.page-header p {
  margin: 8px 0 0;
  color: #64748b;
}

.refresh-button {
  display: inline-flex;
  height: 42px;
  align-items: center;
  gap: 8px;
  padding: 0 15px;
  border: 1px solid #d6dfeb;
  border-radius: 10px;
  background: #fff;
  color: #334155;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.refresh-button:hover {
  border-color: #0d6efd;
  color: #0d6efd;
}

.refresh-button svg {
  width: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.orders-list {
  display: grid;
  gap: 18px;
}

.order-card {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 10px 32px rgba(15, 23, 42, 0.06);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.order-card:hover {
  border-color: #c9daf5;
  box-shadow: 0 16px 42px rgba(15, 23, 42, 0.09);
  transform: translateY(-2px);
}

.order-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 22px 24px;
  border-bottom: 1px solid #eef2f7;
}

.order-identity {
  display: flex;
  align-items: center;
  gap: 13px;
}

.order-icon {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 12px;
  background: #eaf2ff;
  color: #0d6efd;
}

.order-icon svg {
  width: 23px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.order-label {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.order-identity h2 {
  margin: 3px 0 0;
  color: #1e293b;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 16px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 11px;
  border-radius: 999px;
  background: #fff7df;
  color: #9a6700;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 3px currentColor;
  opacity: 0.8;
}

.status-pill.completed,
.status-pill.success,
.status-pill.delivered,
.status-pill.paid {
  background: #ecfdf3;
  color: #15803d;
}

.status-pill.processing,
.status-pill.confirmed,
.status-pill.shipped {
  background: #eaf2ff;
  color: #0d6efd;
}

.status-pill.failed,
.status-pill.cancelled,
.status-pill.canceled {
  background: #fff1f2;
  color: #be123c;
}

.order-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 22px 24px;
}

.overview-item {
  min-width: 0;
  padding: 0 20px;
  border-right: 1px solid #eef2f7;
}

.overview-item:first-child {
  padding-left: 0;
}

.overview-item:last-child {
  padding-right: 0;
  border-right: 0;
}

.overview-item > span {
  display: block;
  margin-bottom: 6px;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.overview-item strong {
  display: block;
  overflow: hidden;
  color: #334155;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.overview-item small {
  display: block;
  margin-top: 4px;
  overflow: hidden;
  color: #94a3b8;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.total-item strong {
  color: #0d6efd;
  font-size: 20px;
}

.order-details {
  margin: 0 24px;
  padding: 22px 0;
  border-top: 1px solid #eef2f7;
}

.detail-heading h3 {
  margin: 0;
  color: #1e293b;
  font-size: 15px;
}

.detail-heading p {
  margin: 4px 0 16px;
  color: #94a3b8;
  font-size: 12px;
}

.item-list {
  display: grid;
  gap: 9px;
}

.order-item {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  background: #fbfdff;
}

.item-image {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  overflow: hidden;
  border: 1px solid #e5ebf3;
  border-radius: 9px;
  background: #fff;
  color: #94a3b8;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.item-image svg {
  width: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
}

.item-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.item-copy strong {
  overflow: hidden;
  color: #334155;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-copy small {
  color: #94a3b8;
  font-size: 11px;
}

.item-total {
  color: #1e293b;
  font-size: 13px;
  font-weight: 800;
}

.no-item-details {
  margin: 0;
  padding: 16px;
  border-radius: 10px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
}

.card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 15px 24px;
  border-top: 1px solid #eef2f7;
  background: #fbfdff;
}

.support-copy {
  color: #94a3b8;
  font-size: 12px;
}

.details-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  border: 0;
  border-radius: 9px;
  background: #eaf2ff;
  color: #0d6efd;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.details-button svg {
  width: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  transition: transform 0.2s ease;
}

.details-button svg.rotated {
  transform: rotate(180deg);
}

.state-card {
  display: flex;
  min-height: 420px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 60px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  background: linear-gradient(145deg, #fff, #f4f8ff);
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.06);
  text-align: center;
}

.state-card h2 {
  margin: 18px 0 8px;
  color: #172033;
  font-size: 25px;
}

.state-card > p {
  max-width: 480px;
  margin: 0;
  color: #64748b;
  line-height: 1.65;
}

.state-icon {
  display: grid;
  width: 94px;
  height: 94px;
  place-items: center;
  border-radius: 28px;
  background: #eaf2ff;
  color: #0d6efd;
}

.state-icon svg {
  width: 43px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.empty-label {
  margin: 22px 0 0;
}

.empty-card h2 {
  margin-top: 7px;
}

.state-actions {
  display: flex;
  gap: 11px;
  margin-top: 26px;
}

.primary-button,
.secondary-button {
  padding: 12px 20px;
  border-radius: 10px;
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.primary-button {
  border: 1px solid #0d6efd;
  background: #0d6efd;
  color: #fff;
}

.secondary-button {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
}

.spinner {
  width: 42px;
  height: 42px;
  border: 4px solid #dbeafe;
  border-top-color: #0d6efd;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 760px) {
  .my-orders-page {
    padding: 36px 0 58px;
  }

  .container {
    padding: 0 14px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .order-topline {
    align-items: flex-start;
    padding: 18px;
  }

  .order-overview {
    grid-template-columns: 1fr 1fr;
    gap: 20px 0;
    padding: 20px 18px;
  }

  .overview-item {
    padding: 0 14px;
  }

  .overview-item:nth-child(2) {
    border-right: 0;
  }

  .overview-item:nth-child(3) {
    padding-left: 0;
  }

  .order-details {
    margin: 0 18px;
  }

  .card-actions {
    align-items: stretch;
    flex-direction: column;
    padding: 14px 18px;
  }

  .details-button {
    justify-content: center;
  }

  .state-actions {
    width: 100%;
    flex-direction: column;
  }
}
</style>
