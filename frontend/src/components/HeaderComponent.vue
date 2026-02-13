<template>
  <header class="header">
    <div class="top-header">
      <div class="header-container">

        <RouterLink to="/" class="logo">
          <img src="../assets/logo.png" class="logo-img" />
        </RouterLink>

        <div class="nav-links">
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/products">Products</RouterLink>
          <RouterLink to="/about">About Us</RouterLink>
          <RouterLink to="/contact">Contact Us</RouterLink>
        </div>

        <div class="top-menu-bar">



          <RouterLink to="/wishlist" class="menu-item cart-link">
            <div class="icon-wrapper">
              <img src="../assets/wishlist.png" />
              <span v-if="wishlistCount > 0" class="cart-badge">{{ wishlistCount }}</span>
            </div>
            <span>Wishlist</span>
          </RouterLink>

          <RouterLink to="/cart" class="menu-item cart-link">
            <div class="icon-wrapper">
              <img src="../assets/cart.png" />
              <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
            </div>
            <span>Cart</span>
          </RouterLink>

          <div v-if="!isLoggedIn" class="button-item">
            <RouterLink to="/login" class="button" style="text-decoration: none;">
              <img src="../assets/acc.png" />
              <span>Account</span>
            </RouterLink>
          </div>

          <div v-else class="user-menu">
            <div class="user-info" @click="toggleDropdown">
              <img src="../assets/acc.png" />
              <span>{{ user?.firstName || 'User' }}</span>
              <span class="dropdown-arrow">▼</span>
            </div>

            <div v-if="showDropdown" class="dropdown">
              <div class="dropdown-item">
                <span class="user-email">{{ user?.email }}</span>
              </div>
              <hr />

              <RouterLink v-if="isAdmin" to="/admin/dashboard" class="dropdown-item admin-link" @click="closeDropdown">
                Dashboard (Admin)
              </RouterLink>

              <div class="dropdown-item" @click="openProfile">
                Profile
              </div>

              <RouterLink to="/my-orders" class="dropdown-item" @click="closeDropdown">
                My Orders
              </RouterLink>
              <hr />
              <div class="dropdown-item logout" @click="handleLogout">
                Logout
              </div>
            </div>
            <UserProfileModal v-if="showProfileModal" :user="user" @close="showProfileModal = false" />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import authService from '@/auth/auth.service';
import cartService from '@/service/cart';
import wishlistService from '@/service/wishlist';
import UserProfileModal from './UserProfileModal.vue';

export default {
  name: 'HeaderComponent',
  components: { UserProfileModal },
  data() {
    return {
      isLoggedIn: false,
      user: null,
      showDropdown: false,
      showProfileModal: false
    }
  },
  computed: {
    isAdmin() {
      return this.user?.roles?.includes('admin');
    },
    cartCount() {
      return cartService.totalItems.value;
    },
    wishlistCount() {
      return wishlistService.totalItems.value;
    }
  },
  mounted() {
    this.checkAuth();
    window.addEventListener('storage', this.checkAuth);
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.checkAuth);
  },
  methods: {
    checkAuth() {
      this.isLoggedIn = authService.isAuthenticated();
      this.user = authService.getCurrentUser();
    },
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    closeDropdown() {
      this.showDropdown = false;
    },
    openProfile() {
      this.showProfileModal = true;
      this.closeDropdown();
    },
    async handleLogout() {
      try {
        await authService.logout();

        cartService.reloadCart();

        this.isLoggedIn = false;
        this.user = null;
        this.showDropdown = false;
        this.$router.push('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  },
  watch: {
    $route() {
      this.checkAuth();
      this.closeDropdown();
    }
  }
}
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.router-link-active {
  color: #0d6efd !important;
  font-weight: bold;
}

.top-header {
  padding: 20px 0;
  border-bottom: 1px solid #ececec;
}

.header-container {
  max-width: 1750px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 25px;
  font-size: 16px;
  font-weight: 500;
}

.nav-links a {
  color: #253d4e;
  transition: color 0.3s ease;
  text-decoration: none;
}

.top-menu-bar {
  display: flex;
  align-items: center;
  gap: 25px;
}

.menu-item,
.button {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: color 0.3s ease;
  color: #253d4e;
  font-size: 14px;
  font-weight: 500;
  position: relative;
  text-decoration: none;
}

.cart-link {
  position: relative;
}

.icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #db4444;
  color: white;
  font-size: 10px;
  font-weight: bold;
  height: 16px;
  min-width: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid white;
}

.button-item .button {
  background-color: #0990ff;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  color: #fff;
  box-shadow: 0 4px #066bbd;
  transition: all 0.2s ease;
}

.menu-item:hover {
  color: #0990ff;
}

.button-item .button:active {
  box-shadow: 0 2px #066bbd;
  transform: translateY(2px);
}

.menu-item img {
  width: 18px;
  height: 18px;
}

.user-menu {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 8px 12px;
  background-color: #0990ff;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px #066bbd;
  transition: all 0.2s ease;
}

.user-info:active {
  box-shadow: 0 2px #066bbd;
  transform: translateY(2px);
}

.user-info img {
  width: 18px;
  height: 18px;
}

.dropdown-arrow {
  font-size: 10px;
  margin-left: 4px;
}

.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  overflow: hidden;
  z-index: 1001;
}

.dropdown-item {
  padding: 12px 16px;
  color: #253d4e;
  text-decoration: none;
  display: block;
  transition: background 0.2s ease;
  cursor: pointer;
  font-size: 14px;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.user-email {
  color: #666;
  font-size: 12px;
  font-weight: normal;
}

.dropdown hr {
  margin: 0;
  border: none;
  border-top: 1px solid #ececec;
}

.dropdown-item.logout {
  color: #dc3545;
  font-weight: 500;
}

.dropdown-item.logout:hover {
  background-color: #fff5f5;
}

@media (max-width: 968px) {
  .header-container {
    flex-wrap: wrap;
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .top-header {
    padding: 15px 0;
  }

  .header-container {
    padding: 0 10px;
  }

  .logo-img {
    width: 32px;
    height: 32px;
  }

  .top-menu-bar {
    gap: 15px;
  }

  .menu-item span {
    display: none;
  }

  .menu-item {
    gap: 0;
  }

  .user-info span:first-of-type {
    display: none;
  }

  .dropdown {
    right: -10px;
  }
}
</style>
