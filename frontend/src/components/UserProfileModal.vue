<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="profile-card">
      <button class="close-btn" @click="$emit('close')">&times;</button>

      <div v-if="loading" class="loader-container">
        <div class="loader"></div>
      </div>

      <template v-else-if="profile">
        <div class="profile-header">
          <div class="avatar-large">{{ profile.firstName?.charAt(0) }}</div>
          <h2>User Profile</h2>
          <div class="role-container">
             <span v-for="role in profile.roles || []" :key="role" class="role-badge">
                {{ role }}
             </span>
          </div>
        </div>

        <div class="profile-body">
          <div class="name-row">
            <div class="info-row">
              <label>First Name</label>
              <p>{{ profile.firstName }}</p>
            </div>
            <div class="info-row">
              <label>Last Name</label>
              <p>{{ profile.lastName }}</p>
            </div>
          </div>

          <div class="info-row">
            <label>Email Address</label>
            <p>{{ profile.email }}</p>
          </div>
<!--
          <div class="info-row">
            <label>User ID</label>
            <p class="id-text">{{ profile.id }}</p>
          </div>

          <div class="info-row">
            <label>Member Since</label>
            <p>{{ new Date(profile.createdAt).toLocaleDateString() }}</p>
          </div> -->
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits } from 'vue';
import userService from '@/service/user.service';

const props = defineProps({
  user: Object // This is the basic user from the header
});

// eslint-disable-next-line no-unused-vars
const emit = defineEmits(['close']);
const profile = ref(null);
const loading = ref(true);

// UserProfileModal.vue <script setup>
const fetchFullProfile = async () => {
  loading.value = true;
  try {
    // 1. Call the "Me" endpoint instead of "All Users"
    profile.value = await userService.getMyProfile();
  } catch (error) {
    console.error("Failed to load profile", error);
    // Fallback: If the endpoint doesn't exist yet, use the basic user prop
    profile.value = props.user;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchFullProfile);
</script>

<style scoped>
/* Modal Overlay & Card */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center; z-index: 9999;
}
.profile-card {
  background: white; border-radius: 16px; padding: 30px;
  width: 90%; max-width: 450px; position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Reusing your Admin styles for consistency */
.avatar-large {
  width: 70px; height: 70px; background: #0990ff; color: white;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 28px; font-weight: bold; margin: 0 auto 15px;
}
.role-container { display: flex; gap: 5px; justify-content: center; margin-bottom: 20px; }
.role-badge {
  font-size: 0.7rem; background: #f1f5f9; color: #475569;
  padding: 3px 8px; border-radius: 4px; font-weight: 700; border: 1px solid #e2e8f0;
}
.name-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.info-row { margin-bottom: 15px; text-align: left; }
.info-row label { display: block; font-size: 0.7rem; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
.info-row p { font-weight: 600; color: #1e293b; margin: 0; }
.id-text { font-family: monospace; font-size: 11px !important; color: #94a3b8 !important; }

/* Loader */
.loader-container { padding: 40px; text-align: center; }
.loader {
  border: 3px solid #f3f3f3; border-top: 3px solid #0990ff;
  border-radius: 50%; width: 30px; height: 30px;
  animation: spin 1s linear infinite; margin: 0 auto;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.close-btn { position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; }
</style>
