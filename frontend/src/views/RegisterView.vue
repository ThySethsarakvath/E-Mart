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
          <h2>Create an account</h2>
          <p class="subtitle">Enter your details below</p>

          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
          <div v-if="successMessage" class="success-message">{{ successMessage }}</div>

          <form @submit.prevent="handleRegister">
            <div class="input-group">
              <input type="text" placeholder="Name" v-model="form.name" required />
            </div>
            <div class="input-group">
              <input type="email" placeholder="Email or Phone Number" v-model="form.email" required />
            </div>
            <div class="input-group">
              <input type="password" placeholder="Password" v-model="form.password" required minlength="6" />
            </div>

            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? 'Creating Account...' : 'Create Account' }}
            </button>

            <button type="button" class="btn-google">
              <img src="../assets/icon/goo.png" alt="Google" class="goo-icon" />
              Sign up with Google
            </button>
          </form>

          <p class="login-redirect">
            Already have account? <RouterLink to="/login" class="link-black">Log in</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '../auth/auth.service.js';
export default {
  name: 'RegisterView',
  data() {
    return {
      form: {
        name: '',
        email: '',
        password: ''
      },
      loading: false,
      errorMessage: '',
      successMessage: ''
    }
  },
  methods: {
    async handleRegister() {
      this.errorMessage = '';
      this.successMessage = '';
      this.loading = true;

      try {
        await authService.register(this.form);

        this.successMessage = 'Account created successfully! Redirecting to login...';

        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.$router.push('/login');
        }, 2000);
      } catch (error) {
        this.errorMessage = error.message || 'Registration failed. Please try again.';
        console.error('Registration error:', error);
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

.btn-primary {
  width: 100%;
  background-color: #0088ff;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s;
}

.btn-google {
  width: 100%;
  background-color: transparent;
  border: 1px solid #ccc;
  padding: 12px;
  border-radius: 4px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
}

.goo-icon { width: 24px; }

.login-redirect {
  margin-top: 30px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.link-black {
  color: #000;
  font-weight: 600;
  text-decoration: underline;
}

.error-message, .success-message {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.error-message { background: #fee; color: #c33; border-left: 4px solid #c33; }
.success-message { background: #efe; color: #3c3; border-left: 4px solid #3c3; }

@media (max-width: 992px) {
  .auth-content { flex-direction: column; margin: 40px auto; }
  .form-section { padding-left: 0; margin-top: 40px; }
  .banner-section { display: none; }
}
</style>
