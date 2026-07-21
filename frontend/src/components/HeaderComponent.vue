<script>
import authService from '@/auth/auth.service'
import cartService from '@/service/cart'
import wishlistService from '@/service/wishlist'
import UserProfileModal from './UserProfileModal.vue'

export default {
  name: 'HeaderComponent',
  components: { UserProfileModal },
  data() {
    return {
      isLoggedIn: false,
      user: null,
      showDropdown: false,
      showProfileModal: false,
    }
  },
  computed: {
    isAdmin() {
      return this.user?.roles?.some((role) => String(role).toLowerCase() === 'admin')
    },
    cartCount() {
      return cartService.totalItems.value
    },
    wishlistCount() {
      return wishlistService.totalItems.value
    },
    displayName() {
      return this.user?.firstName || this.user?.email?.split('@')[0] || 'Account'
    },
    userInitials() {
      const firstName = this.user?.firstName?.trim() || ''
      const lastName = this.user?.lastName?.trim() || ''
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U'
    },
  },
  mounted() {
    this.checkAuth()
    window.addEventListener('storage', this.checkAuth)
    document.addEventListener('pointerdown', this.handleOutsideClick)
    document.addEventListener('keydown', this.handleKeydown)
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.checkAuth)
    document.removeEventListener('pointerdown', this.handleOutsideClick)
    document.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    checkAuth() {
      this.isLoggedIn = authService.isAuthenticated()
      this.user = authService.getCurrentUser()
    },
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },
    closeDropdown() {
      this.showDropdown = false
    },
    handleOutsideClick(event) {
      if (this.$refs.userMenu && !this.$refs.userMenu.contains(event.target)) {
        this.closeDropdown()
      }
    },
    handleKeydown(event) {
      if (event.key === 'Escape') {
        this.closeDropdown()
      }
    },
    openProfile() {
      this.showProfileModal = true
      this.closeDropdown()
    },
    async handleLogout() {
      try {
        await authService.logout()
        cartService.reloadCart()
        this.isLoggedIn = false
        this.user = null
        this.showDropdown = false
        this.$router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
      }
    },
  },
  watch: {
    $route() {
      this.checkAuth()
      this.closeDropdown()
    },
  },
}
</script>

<template>
  <header class="header">
    <div class="top-header">
      <div class="header-container">
        <RouterLink to="/" class="logo" aria-label="E-Mart home">
          <img src="../assets/logo.png" class="logo-img" alt="E-Mart" />
        </RouterLink>

        <nav class="nav-links" aria-label="Main navigation">
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/products">Products</RouterLink>
          <RouterLink to="/about">About Us</RouterLink>
          <RouterLink to="/contact">Contact Us</RouterLink>
        </nav>

        <div class="top-menu-bar">
          <RouterLink to="/wishlist" class="menu-item">
            <span class="icon-wrapper">
              <img src="../assets/wishlist.png" alt="" />
              <span v-if="wishlistCount > 0" class="cart-badge">{{ wishlistCount }}</span>
            </span>
            <span>Wishlist</span>
          </RouterLink>

          <RouterLink to="/cart" class="menu-item">
            <span class="icon-wrapper">
              <img src="../assets/cart.png" alt="" />
              <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
            </span>
            <span>Cart</span>
          </RouterLink>

          <RouterLink v-if="!isLoggedIn" to="/login" class="account-login">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4"></circle>
              <path d="M4.5 21a7.5 7.5 0 0 1 15 0"></path>
            </svg>
            <span>Account</span>
          </RouterLink>

          <div v-else ref="userMenu" class="user-menu">
            <button
              type="button"
              class="user-trigger"
              :aria-expanded="showDropdown"
              aria-haspopup="menu"
              @click="toggleDropdown"
            >
              <span class="avatar">{{ userInitials }}</span>
              <span class="trigger-copy">
                <small>My account</small>
                <strong>{{ displayName }}</strong>
              </span>
              <svg class="chevron" :class="{ rotated: showDropdown }" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </button>

            <Transition name="dropdown">
              <div v-if="showDropdown" class="account-dropdown" role="menu">
                <div class="dropdown-profile">
                  <span class="dropdown-avatar">{{ userInitials }}</span>
                  <div>
                    <strong>{{ user?.firstName }} {{ user?.lastName }}</strong>
                    <span>{{ user?.email }}</span>
                  </div>
                </div>

                <div class="dropdown-nav">
                  <RouterLink
                    v-if="isAdmin"
                    to="/admin/dashboard"
                    class="dropdown-link admin-link"
                    role="menuitem"
                    @click="closeDropdown"
                  >
                    <span class="link-icon">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                        <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                        <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                        <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                      </svg>
                    </span>
                    <span><strong>Admin dashboard</strong><small>Manage your store</small></span>
                  </RouterLink>

                  <button type="button" class="dropdown-link" role="menuitem" @click="openProfile">
                    <span class="link-icon">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="8" r="4"></circle>
                        <path d="M4.5 21a7.5 7.5 0 0 1 15 0"></path>
                      </svg>
                    </span>
                    <span><strong>My profile</strong><small>View account details</small></span>
                  </button>

                  <RouterLink
                    to="/my-orders"
                    class="dropdown-link"
                    role="menuitem"
                    @click="closeDropdown"
                  >
                    <span class="link-icon">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m3 7 9 5 9-5M12 12v9"></path>
                        <path d="m5 5 7-3 7 3 2 2v10l-9 5-9-5V7l2-2Z"></path>
                      </svg>
                    </span>
                    <span><strong>My orders</strong><small>Track your purchases</small></span>
                  </RouterLink>
                </div>

                <div class="dropdown-footer">
                  <button type="button" class="logout-button" role="menuitem" @click="handleLogout">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M10 17l5-5-5-5M15 12H3M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"></path>
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <UserProfileModal
      v-if="showProfileModal"
      :user="user"
      @close="showProfileModal = false"
    />
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid #e8edf4;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 5px 22px rgba(15, 23, 42, 0.05);
  backdrop-filter: blur(16px);
}

.top-header {
  padding: 12px 0;
}

.header-container {
  display: flex;
  max-width: 1500px;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  margin: 0 auto;
  padding: 0 24px;
}

.logo {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  text-decoration: none;
}

.logo-img {
  width: 72px;
  height: 72px;
  object-fit: contain;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
}

.nav-links a {
  position: relative;
  padding: 10px 0;
  color: #334155;
  font-size: 14px;
  font-weight: 650;
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-links a::after {
  position: absolute;
  right: 0;
  bottom: 3px;
  left: 0;
  height: 2px;
  border-radius: 999px;
  background: #0d6efd;
  content: '';
  opacity: 0;
  transform: scaleX(0.35);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #0d6efd;
}

.nav-links a:hover::after,
.nav-links a.router-link-active::after {
  opacity: 1;
  transform: scaleX(1);
}

.top-menu-bar {
  display: flex;
  align-items: center;
  gap: 18px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #334155;
  font-size: 13px;
  font-weight: 650;
  text-decoration: none;
  transition: color 0.2s ease;
}

.menu-item:hover,
.menu-item.router-link-active {
  color: #0d6efd;
}

.icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.icon-wrapper img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.cart-badge {
  position: absolute;
  top: -9px;
  right: -10px;
  display: grid;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  place-items: center;
  border: 2px solid #fff;
  border-radius: 999px;
  background: #dc3545;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
}

.account-login,
.user-trigger {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  border: 0;
  border-radius: 12px;
  background: #0d6efd;
  box-shadow: 0 8px 18px rgba(13, 110, 253, 0.2);
  color: #fff;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.account-login {
  gap: 8px;
  padding: 0 15px;
}

.account-login:hover,
.user-trigger:hover {
  background: #0b5ed7;
  box-shadow: 0 10px 22px rgba(13, 110, 253, 0.26);
  transform: translateY(-1px);
}

.account-login svg {
  width: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
}

.user-menu {
  position: relative;
  z-index: 1200;
}

.user-trigger {
  gap: 10px;
  min-width: 176px;
  padding: 6px 10px 6px 7px;
  text-align: left;
}

.avatar,
.dropdown-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-weight: 800;
  line-height: 4;
  text-align: center;
}

.avatar {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  font-size: 11px;
}

.trigger-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.trigger-copy small {
  color: rgba(255, 255, 255, 0.72);
  font-size: 9px;
  font-weight: 600;
}

.trigger-copy strong {
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron {
  width: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  transition: transform 0.2s ease;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.account-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  z-index: 1201;
  width: 310px;
  overflow: visible;
  border: 1px solid #c8d6e8;
  border-top: 3px solid #0d6efd;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
  color: #1e293b;
}

.account-dropdown::before {
  position: absolute;
  top: -8px;
  right: 28px;
  width: 14px;
  height: 14px;
  border-top: 1px solid #c8d6e8;
  border-left: 1px solid #c8d6e8;
  background: #f5f9ff;
  content: '';
  transform: rotate(45deg);
}

.dropdown-profile {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px;
  border-bottom: 1px solid #eef2f7;
  border-radius: 13px 13px 0 0;
  background: linear-gradient(135deg, #eaf2ff, #fff);
}

.dropdown-avatar {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border-radius: 50%;
  background: #0d6efd;
  font-size: 13px;
}

.dropdown-profile > div {
  min-width: 0;
}

.dropdown-profile strong,
.dropdown-profile span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-profile strong {
  color: #1e293b;
  font-size: 14px;
}

.dropdown-profile span {
  margin-top: 3px;
  color: #64748b;
  font-size: 11px;
}

.dropdown-nav {
  display: grid;
  gap: 3px;
  padding: 8px;
}

.dropdown-link {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #334155;
  font: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
}

.dropdown-link:hover {
  background: #f1f6ff;
  color: #0d6efd;
}

.link-icon {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  place-items: center;
  border-radius: 10px;
  background: #f1f5f9;
  color: #64748b;
}

.dropdown-link:hover .link-icon,
.admin-link .link-icon {
  background: #eaf2ff;
  color: #0d6efd;
}

.link-icon svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.dropdown-link > span:last-child {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.dropdown-link strong {
  font-size: 12px;
}

.dropdown-link small {
  color: #94a3b8;
  font-size: 10px;
}

.dropdown-footer {
  padding: 9px;
  border-top: 1px solid #eef2f7;
  border-radius: 0 0 13px 13px;
  background: #fbfdff;
}

.logout-button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 9px;
  padding: 10px 12px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #dc2626;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.logout-button:hover {
  background: #fff1f2;
}

.logout-button svg {
  width: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
  transform-origin: top right;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

@media (max-width: 1050px) {
  .header-container {
    flex-wrap: wrap;
  }

  .nav-links {
    order: 3;
    width: 100%;
    justify-content: center;
    padding-top: 8px;
    border-top: 1px solid #eef2f7;
  }
}

@media (max-width: 680px) {
  .top-header {
    padding: 9px 0;
  }

  .header-container {
    gap: 14px;
    padding: 0 12px;
  }

  .logo-img {
    width: 52px;
    height: 52px;
  }

  .top-menu-bar {
    gap: 13px;
  }

  .menu-item > span:last-child,
  .account-login span,
  .trigger-copy {
    display: none;
  }

  .user-trigger {
    min-width: 0;
    gap: 5px;
  }

  .nav-links {
    gap: 18px;
    overflow-x: auto;
    justify-content: flex-start;
  }

  .nav-links a {
    flex: 0 0 auto;
    font-size: 13px;
  }

  .account-dropdown {
    right: -6px;
    width: min(310px, calc(100vw - 24px));
  }
}
</style>
