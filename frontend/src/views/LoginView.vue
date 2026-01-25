<template>
  <div class="login-container">

    <div class="login-content">
      <div class="banner-section">
        <img src="../assets/authposter.png" alt="Promo Banner" class="promo-img" />
      </div>

      <div class="form-section">
        <div class="form-wrapper">
          <h2>Log in to Exclusive</h2>
          <p class="subtitle">Enter your details below</p>

          <form @submit.prevent="handleLogin">
            <div class="input-group">
              <input type="text" placeholder="Email or Phone Number" v-model="form.email" />
            </div>
            <div class="input-group">
              <input type="password" placeholder="Password" v-model="form.password" />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary">Log In</button>
              <RouterLink to="/register" class="forgot-link">Don't Have an Account? Sign Up</RouterLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      form: {
        email: '',
        password: ''
      }
    }
  },
  methods: {
    handleLogin() {
      console.log('Logging in with:', this.form);
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  background-color: #e7e7e7;
  position: relative;
}

.breadcrumb {
  max-width: 1200px;
  margin: 40px auto 0;
  width: 100%;
  padding: 0 20px;
  font-size: 14px;
  color: #7d879c;
}

.breadcrumb span {
  color: #000;
}

.login-content {
  display: flex;
  max-width: 1200px;
  margin: 40px auto 80px;
  width: 100%;
  padding: 0 20px;
  align-items: center;
  gap: 80px;
}

.banner-section {
  flex: 1.2;
}

.promo-img {
  width: 100%;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-section {
  flex: 0.8;
}

.form-wrapper {
  max-width: 400px;
}

h2 {
  font-size: 32px;
  font-weight: 500;
  color: #000;
  margin-bottom: 15px;
  letter-spacing: 0.5px;
}

.subtitle {
  color: #000;
  margin-bottom: 40px;
  font-size: 16px;
}

.input-group {
  margin-bottom: 30px;
}

input {
  width: 100%;
  border: none;
  border-bottom: 1px solid #7d879c;
  padding: 12px 0;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;
  background: transparent;
}

input:focus {
  border-bottom-color: #0d6efd;
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
}

.btn-primary {
  background-color: #0088ff;
  color: white;
  border: none;
  padding: 14px 45px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-primary:hover {
  background-color: #0077ee;
}

.forgot-link {
  color: #0088ff;
  text-decoration: none;
  font-size: 16px;
}

.forgot-link:hover {
  text-decoration: underline;
}

.skyline-footer {
  width: 100%;
  margin-top: auto;
  line-height: 0;
}

.skyline-footer img {
  width: 100%;
  height: auto;
}

@media (max-width: 992px) {
  .login-content {
    flex-direction: column;
    gap: 40px;
    margin: 20px auto 40px;
  }

  .banner-section {
    width: 100%;
    max-width: 500px;
  }

  .form-section {
    width: 100%;
  }
}
</style>
