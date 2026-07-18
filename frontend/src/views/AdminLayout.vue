<template>
  <div class="admin-shell">
    <button
      v-if="sidebarOpen"
      class="sidebar-scrim"
      aria-label="Close navigation"
      @click="sidebarOpen = false"
    />

    <aside class="sidebar" :class="{ 'sidebar--open': sidebarOpen }">
      <div class="brand">
        <router-link to="/admin/dashboard" class="brand-link" @click="sidebarOpen = false">
          <span class="brand-mark">
            <img src="../assets/logo.png" alt="E-Mart" />
          </span>
          <span class="brand-copy">
            <strong>E-Mart</strong>
            <small>Admin Console</small>
          </span>
        </router-link>
        <button class="icon-button sidebar-close" aria-label="Close navigation" @click="sidebarOpen = false">
          <AdminIcon name="close" />
        </button>
      </div>

      <div class="nav-section">
        <p class="nav-label">Workspace</p>
        <nav class="nav-menu" aria-label="Admin navigation">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="nav-item"
            @click="sidebarOpen = false"
          >
            <span class="nav-icon">
              <AdminIcon :name="item.icon" />
            </span>
            <span>{{ item.label }}</span>
          </router-link>
        </nav>
      </div>

      <div class="sidebar-footer">
        <div class="admin-avatar">
          {{ getInitials(user?.firstName, user?.lastName) }}
        </div>
        <div class="admin-meta">
          <p class="name">{{ displayName }}</p>
          <p class="role">Administrator</p>
        </div>
        <button class="icon-button logout-button" title="Sign out" aria-label="Sign out" @click="handleLogout">
          <AdminIcon name="logout" />
        </button>
      </div>
    </aside>

    <div class="admin-workspace">
      <header class="topbar">
        <div class="title-group">
          <button class="icon-button menu-button" aria-label="Open navigation" @click="sidebarOpen = true">
            <AdminIcon name="menu" />
          </button>
          <div>
            <p class="eyebrow">Admin workspace</p>
            <h1>{{ pageTitle }}</h1>
          </div>
        </div>

        <div class="header-actions">
          <span class="date-chip">
            <AdminIcon name="calendar" />
            {{ formattedDate }}
          </span>
          <button class="store-button" @click="goToHome">
            <AdminIcon name="store" />
            <span>View store</span>
          </button>
        </div>
      </header>

      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import authService from '@/auth/auth.service'
import AdminIcon from '@/components/admin/AdminIcon.vue'

export default {
  name: 'AdminLayout',
  components: { AdminIcon },
  data() {
    return {
      user: null,
      sidebarOpen: false,
      navItems: [
        { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { to: '/admin/products', label: 'Products', icon: 'package' },
        { to: '/admin/categories', label: 'Categories', icon: 'tags' },
        { to: '/admin/banners', label: 'Banners', icon: 'image' },
        { to: '/admin/arrivals', label: 'New Arrivals', icon: 'sparkles' },
        { to: '/admin/promotions', label: 'Promotions', icon: 'promotion' },
        { to: '/admin/orders', label: 'Orders', icon: 'orders' },
        { to: '/admin/users', label: 'Users', icon: 'users' },
      ],
    }
  },
  computed: {
    pageTitle() {
      const titles = {
        'admin-dashboard': 'Dashboard',
        'admin-products': 'Product Management',
        'admin-categories': 'Category Management',
        'admin-banners': 'Banner Management',
        'admin-arrivals': 'New Arrivals',
        'admin-promotions': 'Promotions',
        'orders-management': 'Order Management',
        'users-management': 'User Management',
      }
      return titles[this.$route.name] || 'Admin Console'
    },
    displayName() {
      const fullName = [this.user?.firstName, this.user?.lastName].filter(Boolean).join(' ')
      return fullName || this.user?.email || 'Admin User'
    },
    formattedDate() {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date())
    },
  },
  mounted() {
    this.user = authService.getCurrentUser()

    if (!authService.isAdmin()) {
      this.$router.push('/')
    }
  },
  methods: {
    getInitials(firstName, lastName) {
      const first = firstName?.charAt(0) || ''
      const last = lastName?.charAt(0) || ''
      return (first + last).toUpperCase() || 'AD'
    },
    async handleLogout() {
      await authService.logout()
      this.$router.push('/login')
    },
    goToHome() {
      this.$router.push('/')
    },
  },
}
</script>

<style scoped>
.admin-shell {
  --admin-primary: #0d6efd;
  --admin-primary-dark: #0b5ed7;
  --admin-primary-soft: #e7f1ff;
  --admin-primary-border: #b6d4fe;
  --admin-ink: #0f172a;
  --admin-muted: #64748b;
  --admin-border: #e2e8f0;
  min-height: 100vh;
  background: #f6f8fc;
  color: var(--admin-ink);
}

.admin-shell :deep(a),
.admin-shell :deep(a:hover),
.admin-shell :deep(a:focus),
.admin-shell :deep(a:active),
.admin-shell :deep(a:visited) {
  text-decoration: none !important;
}

.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 40;
  display: flex;
  width: 264px;
  flex-direction: column;
  border-right: 1px solid var(--admin-border);
  background: #fff;
}

.brand {
  display: flex;
  min-height: 80px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f1f5f9;
  padding: 0 20px;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 0;
  color: inherit;
}

.brand-link:hover {
  background: transparent;
}

.brand-mark {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  place-items: center;
  overflow: hidden;
  border: 1px solid var(--admin-primary-border);
  border-radius: 12px;
  background: var(--admin-primary-soft);
}

.brand-mark img {
  width: 54px;
  max-width: none;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-copy strong {
  font-size: 1rem;
  font-weight: 750;
  letter-spacing: -0.02em;
}

.brand-copy small {
  margin-top: 4px;
  color: var(--admin-muted);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.nav-section {
  flex: 1;
  overflow-y: auto;
  padding: 24px 14px;
}

.nav-label {
  margin: 0 12px 10px;
  color: #94a3b8;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  border-radius: 10px;
  color: #475569;
  font-size: 0.88rem;
  font-weight: 600;
  transition: background 160ms ease, color 160ms ease;
}

.nav-item:hover {
  background: #f1f5f9;
  color: var(--admin-ink);
}

.nav-item.router-link-active {
  background: var(--admin-primary-soft);
  color: var(--admin-primary-dark);
}

.nav-icon {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  place-items: center;
  border-radius: 8px;
  color: #64748b;
  font-size: 1.08rem;
}

.router-link-active .nav-icon {
  background: #cfe2ff;
  color: var(--admin-primary);
}

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 11px;
  border-top: 1px solid var(--admin-border);
  padding: 16px;
}

.admin-avatar {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  place-items: center;
  border-radius: 12px;
  background: var(--admin-ink);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 750;
}

.admin-meta {
  min-width: 0;
  flex: 1;
}

.admin-meta p {
  overflow: hidden;
  margin: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-meta .name {
  color: #1e293b;
  font-size: 0.82rem;
  font-weight: 700;
}

.admin-meta .role {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 0.72rem;
}

.icon-button {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 1.15rem;
}

.icon-button:hover {
  background: #f1f5f9;
  color: var(--admin-ink);
}

.logout-button:hover {
  background: #fff1f2;
  color: #e11d48;
}

.sidebar-close,
.menu-button,
.sidebar-scrim {
  display: none;
}

.admin-workspace {
  min-height: 100vh;
  margin-left: 264px;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  min-height: 80px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(255, 255, 255, 0.92);
  padding: 0 32px;
  backdrop-filter: blur(14px);
}

.title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.eyebrow {
  margin: 0 0 2px;
  color: #94a3b8;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.title-group h1 {
  margin: 0;
  color: var(--admin-ink);
  font-size: 1.35rem;
  font-weight: 750;
  letter-spacing: -0.025em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-chip,
.store-button {
  display: inline-flex;
  height: 40px;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--admin-border);
  border-radius: 10px;
  padding: 0 13px;
  background: #fff;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 650;
}

.date-chip :deep(svg),
.store-button :deep(svg) {
  font-size: 1rem;
}

.store-button {
  border-color: var(--admin-ink);
  background: var(--admin-ink);
  color: #fff;
  cursor: pointer;
  transition: background 160ms ease, transform 160ms ease;
}

.store-button:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

.main-content {
  min-height: calc(100vh - 80px);
  padding: 28px 32px 40px;
}

@media (max-width: 900px) {
  .sidebar {
    width: 280px;
    transform: translateX(-101%);
    transition: transform 220ms ease;
    box-shadow: 18px 0 45px rgba(15, 23, 42, 0.12);
  }

  .sidebar--open {
    transform: translateX(0);
  }

  .sidebar-close,
  .menu-button {
    display: grid;
  }

  .sidebar-scrim {
    position: fixed;
    inset: 0;
    z-index: 35;
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    background: rgba(15, 23, 42, 0.38);
    backdrop-filter: blur(2px);
  }

  .admin-workspace {
    margin-left: 0;
  }

  .topbar {
    padding: 0 20px;
  }

  .main-content {
    padding: 22px 20px 32px;
  }
}

@media (max-width: 620px) {
  .topbar {
    min-height: 72px;
  }

  .eyebrow,
  .date-chip {
    display: none;
  }

  .title-group h1 {
    font-size: 1.15rem;
  }

  .store-button {
    width: 40px;
    justify-content: center;
    padding: 0;
  }

  .store-button span {
    display: none;
  }

  .main-content {
    min-height: calc(100vh - 72px);
    padding: 18px 14px 28px;
  }
}
</style>
