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
          <div class="menu-item">
            <img src="../assets/compare.png" />
            <span>Compare</span>
          </div>

          <div class="menu-item">
            <img src="../assets/wishlist.png" />
            <span>Wishlist</span>
          </div>

          <div class="menu-item">
            <img src="../assets/cart.png" />
            <span>Cart</span>
          </div>
          <div class="button-item">
            <button class="button">
              <img src="../assets/acc.png" />
              <span>Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'HeaderComponent',
  components: {
  },
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
  /* padding: 20px 0; */
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

.menu-item.cart {
  position: relative;
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
}

@media (max-width: 768px) {
  .top-menu-bar {
    gap: 15px;
  }

  .menu-item span {
    display: none;
  }

  .menu-item {
    gap: 0;
  }
}
</style>
