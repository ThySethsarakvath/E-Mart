<template>
  <div class="my-orders-page">
    <div class="container">
      <h1>Order History</h1>

      <div v-if="loading" class="state-msg">
        <div class="spinner"></div>
        <p>Fetching your orders...</p>
      </div>

      <div v-else-if="orders.length === 0" class="state-msg empty">
        <div class="empty-icon">🛒</div>
        <p>You haven't placed any orders yet.</p>
        <RouterLink to="/products" class="shop-btn">Go Shopping</RouterLink>
      </div>

      <div v-else class="orders-grid">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="card-header">
            <span class="order-id">ID: #{{ String(order.id).split('-')[0] }}</span>
            <span :class="['status-pill', order.status.toLowerCase()]">{{ order.status }}</span>
          </div>
          <div class="card-body">
            <div class="detail">
              <span>Date</span>
              <strong>{{ new Date(order.createdAt).toLocaleDateString() }}</strong>
            </div>
            <div class="detail">
              <span>Total</span>
              <strong class="price">${{ Number(order.total).toFixed(2) }}</strong>
            </div>
          </div>
          <button class="view-details" @click="viewOrder(order.id)">Track Order</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import orderService from '@/service/orders.service';

const orders = ref([]);
const loading = ref(true);

const fetchOrders = async () => {
  loading.value = true;
  try {
    const response = await orderService.getMyOrders();

    // Check if the response is the wrapped object or the raw array
    if (response && response.orders) {
      orders.value = response.orders;
    } else if (Array.isArray(response)) {
      orders.value = response;
    } else {
      orders.value = [];
    }

    console.log("Orders loaded into component:", orders.value);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchOrders);
</script>

<style scoped>
.my-orders-page {
  background: #f8fafc;
  min-height: 90vh;
  padding: 40px 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  color: #1e293b;
  margin-bottom: 30px;
  font-weight: 800;
}

.orders-grid {
  display: grid;
  gap: 20px;
}

.order-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f1f5f9;
}

.order-id {
  font-family: monospace;
  color: #64748b;
  font-weight: bold;
}

.status-pill {
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.status-pill.pending {
  background: #fef9c3;
  color: #854d0e;
}

.status-pill.completed {
  background: #dcfce7;
  color: #15803d;
}

.card-body {
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
}

.detail span {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.price {
  color: #0990ff;
  font-size: 20px;
}

.view-details {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.view-details:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.state-msg {
  text-align: center;
  padding: 100px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0990ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
