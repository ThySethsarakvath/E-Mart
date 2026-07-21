<template>
  <div class="auth-container">
    <div class="auth-content">
      <div class="banner-section">
        <div class="banner-card">
          <img src="../assets/authposter.png" alt="Promo Banner" class="promo-img" />
        </div>
      </div>

      <div class="form-section">
        <div class="form-wrapper">
          <h2>Log in to Exclusive</h2>
          <p class="subtitle">Enter your details below</p>

          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

          <form @submit.prevent="handleLogin">
            <div class="input-group">
              <input type="email" placeholder="Email or Phone Number" v-model="form.email" required />
            </div>
            <div class="input-group">
              <input type="password" placeholder="Password" v-model="form.password" required minlength="6" />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="loading">
                {{ loading ? 'Logging in...' : 'Log In' }}
              </button>
              <RouterLink to="/register" class="link-blue">Don't Have an Account?</RouterLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '../auth/auth.service.js';

export default {
  name: 'LoginView',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      loading: false,
      errorMessage: ''
    }
  },
  methods: {
    async handleLogin() {
      this.errorMessage = '';
      this.loading = true;

      try {
        await authService.login(this.form);
        const isAdmin = authService.isAdmin();

        
        if (isAdmin) {
          this.$router.push('/admin/dashboard');
        } else {
          this.$router.push('/');
        }
        
      } catch (error) {
        console.error('Login error:', error);
        this.errorMessage = error.message || 'Login failed. Please check your credentials.';
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  flex-direction: column;
  background-color: #e7e7e7;
}

.auth-content {
  display: flex;
  max-width: 1100px;
  margin: 80px auto;
  width: 100%;
  padding: 0 20px;
  align-items: center;
  gap: 0;
}

.banner-section {
  flex: 1;
  display: flex;
  justify-content: center;
}

.banner-card {
  width: 100%;
  max-width: 500px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.promo-img {
  width: 100%;
  display: block;
  object-fit: cover;
}

.form-section {
  flex: 1;
  padding-left: 60px;
}

.form-wrapper {
  max-width: 400px;
}

h2 {
  font-size: 32px;
  font-weight: 600;
  color: #000;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  margin-bottom: 40px;
}

.input-group {
  margin-bottom: 25px;
}

input {
  width: 100%;
  border: none;
  border-bottom: 1px solid #ccc;
  padding: 12px 0;
  font-size: 16px;
  outline: none;
  background: transparent;
  transition: border-color 0.3s;
}

input:focus {
  border-bottom-color: #0990ff;
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.btn-primary {
  flex: 1;
  background-color: #0088ff;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover { background-color: #0077ee; }
.btn-primary:disabled { background-color: #ccc; cursor: not-allowed; }

.link-blue {
  color: #0088ff;
  text-decoration: none;
  font-size: 14px;
  white-space: nowrap;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  border-left: 4px solid #c33;
}

@media (max-width: 992px) {
  .auth-content { flex-direction: column; margin: 40px auto; }
  .form-section { padding-left: 0; margin-top: 40px; width: 100%; }
  .banner-section { display: none; }
}
</style>
