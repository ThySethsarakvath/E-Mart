<script setup>
import { computed } from 'vue';
import cartService from '@/service/cart';

const show = computed(() => cartService.state.notification.show);
const message = computed(() => cartService.state.notification.message);
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="toast-popup">
      <div class="toast-content">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>{{ message }}</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.toast-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  
  background-color: #0d6efd; /* Blue */
  color: white;
  padding: 20px 30px;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 300px;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>