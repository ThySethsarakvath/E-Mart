<template>
  <div class="admin-orders">
    <div class="page-header">
      <div>
        <p class="section-kicker">Operations</p>
        <h2 class="page-title">Customer orders</h2>
        <p class="page-subtitle">Track and manage customer transactions</p>
      </div>
      <div class="header-stats" v-if="!loading">
        <div class="stat-card">
          <span class="stat-label">Total Orders</span>
          <span class="stat-value">{{ pagination.total || 0 }}</span>
        </div>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <span class="search-icon"><AdminIcon name="search" /></span>
        <input v-model="searchQuery" type="text" placeholder="Search by Order # or Email..." class="search-input" />
      </div>
      <div class="filter-group">
        <select v-model="statusFilter" class="filter-select">
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button @click="fetchOrders" class="btn-refresh" :disabled="loading" aria-label="Refresh orders">
          <AdminIcon name="refresh" :class="{ spinning: loading }" />
          Refresh
        </button>
      </div>
    </div>

    <div class="table-container shadow-sm">
      <div v-if="loading" class="loading-overlay">
        <div class="loader"></div>
      </div>

      <table class="admin-table">
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id" class="order-row">
            <td><span class="order-id">{{ order.orderNumber }}</span></td>
            <td>
              <div class="date-cell">
                <span class="primary-text">{{ formatDate(order.createdAt) }}</span>
                <span class="secondary-text">{{ formatTime(order.createdAt) }}</span>
              </div>
            </td>
            <td>
              <div class="customer-cell">
                <span class="customer-name">{{ order.customerFirstName }} {{ order.customerLastName }}</span>
                <span class="customer-email">{{ order.customerEmail }}</span>
              </div>
            </td>
            <td><span class="amount-cell">${{ order.total }}</span></td>
            <td>
              <span :class="['status-badge', order.status?.toLowerCase()]">{{ order.status }}</span>
            </td>
            <td>
              <span :class="['pay-badge', order.paymentStatus?.toLowerCase()]">{{ order.paymentStatus }}</span>
            </td>
            <td>
              <div class="actions">
                <button @click="viewOrderDetails(order)" class="btn-icon" title="View order">
                  <AdminIcon name="eye" />
                </button>
                <button @click="openEditStatus(order)" class="btn-icon" title="Update status">
                  <AdminIcon name="settings" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!loading && filteredOrders.length === 0" class="empty-state">
        <div class="empty-icon"><AdminIcon name="orders" /></div>
        <p>No orders match this view</p>
        <p class="empty-hint">Try changing the search term or status filter.</p>
      </div>
    </div>

    <div v-if="selectedOrder" class="modal-overlay" @click="selectedOrder = null">
      <div class="modal-content detailed" @click.stop>
        <div class="modal-header">
          <h3>Order {{ selectedOrder.orderNumber }}</h3>
          <button @click="selectedOrder = null" class="btn-close" aria-label="Close order details">
            <AdminIcon name="close" />
          </button>
        </div>
        <div class="modal-body">
          <div class="details-grid">
            <div class="details-section">
              <h4>Customer</h4>
              <p>{{ selectedOrder.customerFirstName }} {{ selectedOrder.customerLastName }}</p>
              <p>{{ selectedOrder.customerEmail }}</p>
              <p>{{ selectedOrder.customerPhone }}</p>
            </div>
            <div class="details-section">
              <h4>Summary</h4>
              <p>Subtotal: ${{ selectedOrder.subtotal }}</p>
              <p>Tax (10%): ${{ selectedOrder.tax }}</p>
              <p class="highlight">Total: ${{ selectedOrder.total }}</p>
            </div>
          </div>
          <div class="items-list">
            <h4>Items</h4>
            <div v-for="item in selectedOrder.items" :key="item.id" class="item-row">
              <div class="item-info">
                <span class="item-name">{{ item.productName }}</span>
                <span class="item-qty">{{ item.quantity }} x ${{ item.price }}</span>
              </div>
              <span class="item-total">${{ item.subtotal }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="editingOrder" class="modal-overlay" @click="closeStatusModal">
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <div>
            <p class="section-kicker">Fulfillment workflow</p>
            <h3>Update order status</h3>
          </div>
          <button class="btn-close" aria-label="Close status dialog" @click="closeStatusModal">
            <AdminIcon name="close" />
          </button>
        </div>
        <div class="modal-body">
          <div class="status-order-summary">
            <span>Order</span>
            <strong>{{ editingOrder.orderNumber }}</strong>
          </div>
          <div class="form-group">
            <label for="order-status">Status</label>
            <select id="order-status" v-model="newStatus" class="form-input">
              <option v-for="status in statusOptions" :key="status" :value="status">
                {{ status }}
              </option>
            </select>
          </div>
          <div class="modal-actions">
            <button class="btn-text" type="button" @click="closeStatusModal">Cancel</button>
            <button class="btn-primary" type="button" :disabled="updatingStatus" @click="updateOrderStatus">
              {{ updatingStatus ? 'Updating...' : 'Update status' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import orderService from '@/service/orders.service';
import AdminIcon from '@/components/admin/AdminIcon.vue';

const orders = ref([]);
const pagination = ref({});
const loading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('ALL');
const selectedOrder = ref(null);
const editingOrder = ref(null);
const newStatus = ref('PENDING');
const updatingStatus = ref(false);
const statusOptions = ['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

const fetchOrders = async () => {
  loading.value = true;
  try {
    const data = await orderService.getAllOrders(1, 100);
    // Destructure based on your NestJS OrdersService.findAll return
    orders.value = data.orders || [];
    pagination.value = data.pagination || {};
  } catch (error) {
    console.error("Fetch failed", error);
  } finally {
    loading.value = false;
  }
};

const filteredOrders = computed(() => {
  return orders.value.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         o.customerEmail.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesStatus = statusFilter.value === 'ALL' || o.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

const openEditStatus = (order) => {
  editingOrder.value = order;
  newStatus.value = order.status || 'PENDING';
};

const closeStatusModal = () => {
  if (updatingStatus.value) return;
  editingOrder.value = null;
};

const updateOrderStatus = async () => {
  if (!editingOrder.value) return;
  if (newStatus.value === editingOrder.value.status) {
    closeStatusModal();
    return;
  }

  updatingStatus.value = true;
  try {
    await orderService.updateOrderStatus(editingOrder.value.id, newStatus.value);
    editingOrder.value = null;
    await fetchOrders();
  } catch {
    alert('Update failed');
  } finally {
    updatingStatus.value = false;
  }
};

const viewOrderDetails = (order) => { selectedOrder.value = order; };
const formatDate = (d) => new Date(d).toLocaleDateString();
const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

onMounted(fetchOrders);
</script>

<style scoped>
.admin-orders { padding: 20px; animation: fadeIn 0.4s ease-out; }

/* Header & Stat Cards */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
.pay-badge { font-size: 0.7rem; font-weight: 700; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; }
.pay-badge.paid { color: #16a34a; background: #dcfce7; }
.pay-badge.pending { color: #ca8a04; background: #fef9c3; }
.page-title { font-size: 1.8rem; font-weight: 700; color: #1e293b; margin: 0; }
.page-subtitle { color: #64748b; margin: 4px 0 0; }
.header-stats { display: flex; gap: 20px; }
.stat-card { background: white; padding: 15px 25px; border-radius: 12px; border: 1px solid #e2e8f0; min-width: 140px; }
.stat-label { font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.stat-value { display: block; font-size: 1.6rem; font-weight: 800; color: #1e293b; margin-top: 5px; }
.stat-value.warning { color: #f59e0b; }

/* Toolbar */
.toolbar { display: flex; justify-content: space-between; margin-bottom: 20px; gap: 15px; }
.search-box { position: relative; flex: 1; max-width: 450px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-input { width: 100%; padding: 12px 12px 12px 42px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem; transition: 0.2s; }
.search-input:focus { outline: none; border-color: #0d6efd; box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1); }
.filter-group { display: flex; gap: 10px; }
.filter-select { padding: 0 15px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; font-weight: 600; color: #475569; }
.btn-refresh { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0 15px; cursor: pointer; transition: 0.2s; }
.btn-refresh:hover { background: #f8fafc; }

/* Table Section */
.table-container { background: white; border-radius: 16px; border: 1px solid #e2e8f0; position: relative; min-height: 200px; }
.loading-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.8); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; }
.loader { width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #0d6efd; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 10px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.admin-table { width: 100%; border-collapse: collapse; }
.admin-table th { background: #f8fafc; padding: 16px 20px; text-align: left; font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
.admin-table td { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.order-row:hover { background: #fcfdfe; }

.order-id { font-family: 'Monaco', monospace; font-weight: 700; color: #0d6efd; background: #f0f7ff; padding: 4px 8px; border-radius: 6px; }
.date-cell .primary-text { display: block; font-weight: 600; color: #1e293b; }
.date-cell .secondary-text { font-size: 0.75rem; color: #94a3b8; }
.customer-cell .customer-name { display: block; font-weight: 600; color: #1e293b; }
.customer-cell .customer-email { font-size: 0.75rem; color: #94a3b8; }
.amount-cell { font-weight: 800; color: #1e293b; font-size: 1rem; }

/* Status Badges */
.status-badge { padding: 6px 12px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.02em; }
.status-badge.pending { background: #fffbeb; color: #b45309; }
.status-badge.paid { background: #f0fdf4; color: #15803d; }
.status-badge.shipped { background: #f0f9ff; color: #0369a1; }
.status-badge.completed { background: #f8fafc; color: #475569; }
.status-badge.cancelled { background: #fef2f2; color: #b91c1c; }

/* Actions */
.btn-icon { background: white; border: 1px solid #e2e8f0; padding: 8px; border-radius: 8px; cursor: pointer; transition: 0.2s; margin-right: 6px; font-size: 1rem; }
.btn-icon:hover { border-color: #0d6efd; background: #f0f9ff; transform: translateY(-1px); }
.items-preview-btn { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content.detailed { background: white; width: 95%; max-width: 650px; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; }
.modal-header { padding: 20px 25px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 800; }
.modal-body { padding: 25px; max-height: 70vh; overflow-y: auto; }
.details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 25px; }
.details-section h4 { margin: 0 0 10px; font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.details-section p { margin: 6px 0; font-size: 0.9rem; color: #334155; }
.highlight { color: #0d6efd; font-weight: 800; font-size: 1.2rem; }

.item-row { display: flex; align-items: center; gap: 15px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
.item-img-box { width: 55px; height: 55px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
.item-img { width: 100%; height: 100%; object-fit: contain; }
.item-info { flex: 1; }
.item-name { display: block; font-weight: 700; font-size: 0.95rem; color: #1e293b; }
.item-qty { font-size: 0.85rem; color: #64748b; }
.item-total { font-weight: 800; color: #1e293b; }

.modal-footer { padding: 15px 25px; background: #f8fafc; display: flex; justify-content: flex-end; }
.btn-secondary-outline { background: white; border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; }

/* Empty State */
.empty-state { padding: 60px; text-align: center; color: #94a3b8; }
.empty-icon { font-size: 4rem; margin-bottom: 15px; opacity: 0.3; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
