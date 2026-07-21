<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import userService from '@/service/user.service'

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close'])
const profile = ref(null)
const loading = ref(true)
const usedFallback = ref(false)

const initials = computed(() => {
  const firstName = profile.value?.firstName?.trim() || ''
  const lastName = profile.value?.lastName?.trim() || ''
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U'
})

const fullName = computed(() => {
  return [profile.value?.firstName, profile.value?.lastName].filter(Boolean).join(' ') || 'E-Mart customer'
})

const memberSince = computed(() => {
  if (!profile.value?.createdAt) return 'E-Mart member'
  return `Member since ${new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(profile.value.createdAt))}`
})

const fetchFullProfile = async () => {
  loading.value = true
  usedFallback.value = false

  try {
    profile.value = await userService.getMyProfile()
  } catch (error) {
    console.error('Failed to load profile:', error)
    profile.value = props.user
    usedFallback.value = true
  } finally {
    loading.value = false
  }
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  fetchFullProfile()
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" role="presentation" @click.self="emit('close')">
      <section class="profile-card" role="dialog" aria-modal="true" aria-labelledby="profile-title">
      <button type="button" class="close-button" aria-label="Close profile" @click="emit('close')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>
      </button>

      <div v-if="loading" class="loading-state">
        <div class="loader" aria-hidden="true"></div>
        <strong>Loading your profile</strong>
        <span>Retrieving the latest account details.</span>
      </div>

      <template v-else-if="profile">
        <header class="profile-header">
          <div class="header-pattern"></div>
          <div class="profile-identity">
            <span class="large-avatar">{{ initials }}</span>
            <div>
              <span class="profile-label">Customer profile</span>
              <h2 id="profile-title">{{ fullName }}</h2>
              <p>{{ memberSince }}</p>
            </div>
          </div>
        </header>

        <div class="profile-body">
          <div class="section-heading">
            <div>
              <h3>Account information</h3>
              <p>Your personal details registered with E-Mart.</p>
            </div>
            <div class="role-container">
              <span v-for="role in profile.roles || ['customer']" :key="role" class="role-badge">
                {{ role }}
              </span>
            </div>
          </div>

          <p v-if="usedFallback" class="fallback-note">
            Displaying your saved sign-in details while the full profile is unavailable.
          </p>

          <div class="profile-grid">
            <div class="info-field">
              <span class="field-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="8" r="4"></circle>
                  <path d="M4.5 21a7.5 7.5 0 0 1 15 0"></path>
                </svg>
              </span>
              <div>
                <label>First name</label>
                <p>{{ profile.firstName || 'Not provided' }}</p>
              </div>
            </div>

            <div class="info-field">
              <span class="field-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="8" r="4"></circle>
                  <path d="M4.5 21a7.5 7.5 0 0 1 15 0"></path>
                </svg>
              </span>
              <div>
                <label>Last name</label>
                <p>{{ profile.lastName || 'Not provided' }}</p>
              </div>
            </div>

            <div class="info-field wide-field">
              <span class="field-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                  <path d="m4 7 8 6 8-6"></path>
                </svg>
              </span>
              <div>
                <label>Email address</label>
                <p>{{ profile.email || 'Not provided' }}</p>
              </div>
            </div>
          </div>
        </div>

        <footer class="profile-footer">
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            Your account information is protected.
          </span>
          <button type="button" @click="emit('close')">Done</button>
        </footer>
      </template>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.58);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.profile-card {
  position: relative;
  width: min(100%, 590px);
  max-height: calc(100vh - 40px);
  overflow-x: hidden;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 28px 75px rgba(15, 23, 42, 0.3);
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 2;
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 10px;
  background: #0b5ed7;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s ease;
}

.close-button:hover {
  background: #094eaf;
}

.close-button svg {
  width: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
}

.profile-header {
  position: relative;
  overflow: hidden;
  min-height: 170px;
  padding: 46px 34px 28px;
  background: linear-gradient(135deg, #0d6efd, #0953bd);
}

.header-pattern {
  position: absolute;
  top: -70px;
  right: -45px;
  width: 230px;
  height: 230px;
  border: 38px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.profile-identity {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;
}

.large-avatar {
  display: grid;
  width: 78px;
  height: 78px;
  flex: 0 0 78px;
  place-items: center;
  border: 4px solid rgba(255, 255, 255, 0.34);
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(0, 32, 91, 0.24);
  color: #0d6efd;
  font-size: 25px;
  font-weight: 850;
}

.profile-label {
  color: #bfdbfe;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.profile-identity h2 {
  margin: 5px 0 3px;
  color: #fff;
  font-size: 25px;
}

.profile-identity p {
  margin: 0;
  color: #dbeafe;
  font-size: 12px;
}

.profile-body {
  padding: 27px 32px 30px;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.section-heading h3 {
  margin: 0;
  color: #1e293b;
  font-size: 15px;
}

.section-heading p {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 11px;
}

.role-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 5px;
}

.role-badge {
  padding: 5px 9px;
  border-radius: 999px;
  background: #eaf2ff;
  color: #0d6efd;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-field {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
  padding: 15px;
  border: 1px solid #e7edf5;
  border-radius: 13px;
  background: #fbfdff;
}

.wide-field {
  grid-column: 1 / -1;
}

.field-icon {
  display: grid;
  width: 37px;
  height: 37px;
  flex: 0 0 37px;
  place-items: center;
  border-radius: 10px;
  background: #eaf2ff;
  color: #0d6efd;
}

.field-icon svg {
  width: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.info-field > div {
  min-width: 0;
}

.info-field label {
  display: block;
  margin-bottom: 3px;
  color: #94a3b8;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.info-field p {
  overflow: hidden;
  margin: 0;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fallback-note {
  margin: 0 0 14px;
  padding: 10px 12px;
  border-radius: 9px;
  background: #fff7df;
  color: #8a6100;
  font-size: 11px;
}

.profile-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 15px 32px;
  border-top: 1px solid #eef2f7;
  background: #f8fafc;
}

.profile-footer span {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #64748b;
  font-size: 10px;
}

.profile-footer svg {
  width: 16px;
  fill: none;
  stroke: #0d6efd;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.profile-footer button {
  padding: 9px 18px;
  border: 0;
  border-radius: 9px;
  background: #0d6efd;
  color: #fff;
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

.loading-state {
  display: flex;
  min-height: 340px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 40px;
}

.loading-state strong {
  margin-top: 17px;
  color: #1e293b;
  font-size: 14px;
}

.loading-state span {
  margin-top: 5px;
  color: #94a3b8;
  font-size: 11px;
}

.loader {
  width: 36px;
  height: 36px;
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

@media (max-width: 560px) {
  .modal-overlay {
    padding: 10px;
  }

  .profile-header {
    padding: 48px 20px 25px;
  }

  .profile-body {
    padding: 24px 18px;
  }

  .profile-identity {
    align-items: flex-start;
    flex-direction: column;
  }

  .section-heading {
    flex-direction: column;
  }

  .role-container {
    justify-content: flex-start;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }

  .wide-field {
    grid-column: auto;
  }

  .profile-footer {
    align-items: stretch;
    flex-direction: column;
    padding: 14px 18px;
  }
}
</style>
