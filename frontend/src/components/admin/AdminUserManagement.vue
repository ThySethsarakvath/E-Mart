<template>
  <div class="admin-users">
    <div class="page-header">
      <div>
        <h2 class="page-title">User Management</h2>
        <p class="page-subtitle">Manage registered customers and staff roles</p>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <input v-model="searchQuery" type="text" placeholder="Search by email or name..." class="search-input" />
      </div>
      <button @click="fetchUsers" class="btn-refresh" :disabled="loading">🔄 Refresh</button>
    </div>

    <div class="table-container shadow-sm">
      <div v-if="loading" class="loading-overlay">
        <div class="loader"></div>
      </div>

      <table class="admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Joined Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
            <td>
              <div class="user-info">
                <div class="avatar">{{ user.firstName?.charAt(0) || 'U' }}</div>
                <div>
                  <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
                  <div class="role-container">
                    <span v-for="ur in user.userRoles" :key="ur.id" class="role-badge">
                      {{ ur.role?.name }}
                    </span>
                  </div>
                </div>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td>{{ new Date(user.createdAt).toLocaleDateString() }}</td>
            <td>
              <span :class="['status-badge', user.isActive ? 'active' : 'inactive']">
                {{ user.isActive ? 'Active' : 'Suspended' }}
              </span>
            </td>
            <td>
              <div class="actions">
                <button @click="toggleStatus(user)" :title="user.isActive ? 'Suspend' : 'Activate'" class="btn-icon">
                  {{ user.isActive ? '🚫' : '✅' }}
                </button>
                <button @click="confirmDelete(user)" title="Delete" class="btn-icon delete">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import userService from '@/service/user.service';

const users = ref([]);
const loading = ref(false);
const searchQuery = ref('');

const fetchUsers = async () => {
  loading.value = true;
  try {
    users.value = await userService.getAllUsers();
  } catch (error) {
    console.error("Failed to load users", error);
  } finally {
    loading.value = false;
  }
};

const toggleStatus = async (user) => {
  try {
    await userService.toggleUserStatus(user.id);
    await fetchUsers(); // Refresh
  } catch (error) {
    alert("Error changing status");
  }
};

const confirmDelete = async (user) => {
  if (confirm(`Are you sure you want to delete ${user.email}?`)) {
    try {
      await userService.deleteUser(user.id);
      await fetchUsers();
    } catch (error) {
      alert("Error deleting user");
    }
  }
};

const filteredUsers = computed(() => {
  return users.value.filter(u =>
    u.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(fetchUsers);
</script>

<style scoped>
.admin-users {
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.page-header {
  margin-bottom: 25px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-input {
  padding: 10px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 300px;
}

.table-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  background: #f8fafc;
  padding: 15px;
  text-align: left;
  font-size: 0.8rem;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.admin-table td {
  padding: 15px;
  border-bottom: 1px solid #f1f5f9;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 35px;
  height: 35px;
  background: #0990ff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.role-container { display: flex; gap: 4px; margin-top: 4px; }
.role-badge {
  font-size: 0.65rem;
  background: #f1f5f9;
  color: #475569;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 700;
  border: 1px solid #e2e8f0;
}
/* Style for Admin specifically */
.role-badge:contains('ADMIN') {
  background: #eef2ff;
  color: #4338ca;
  border-color: #c7d2fe;
}

.user-name {
  font-weight: 600;
  color: #1e293b;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
}

.status-badge.active {
  background: #dcfce7;
  color: #15803d;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #b91c1c;
}

.btn-icon {
  background: none;
  border: 1px solid #e2e8f0;
  padding: 5px 8px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 5px;
}

.btn-icon:hover {
  background: #f8fafc;
}

.btn-icon.delete:hover {
  border-color: #ef4444;
  background: #fef2f2;
}

.loading-overlay {
  padding: 50px;
  text-align: center;
}

.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0990ff;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
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
