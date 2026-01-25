<template>
  <div class="register-container">
    <div class="register-content">
      <div class="banner-section">
        <div class="banner-card">
            <img src="../assets/authposter.png" alt="Promo Banner" class="promo-img" />
        </div>
      </div>

      <div class="form-section">
        <div class="form-wrapper">
          <h2>Create an account</h2>
          <p class="subtitle">Enter your details below</p>

          <form @submit.prevent="handleRegister">
            <div class="input-group">
              <input type="text" placeholder="Name" v-model="form.name" />
            </div>
            <div class="input-group">
              <input type="text" placeholder="Email or Phone Number" v-model="form.email" />
            </div>
            <div class="input-group">
              <input type="password" placeholder="Password" v-model="form.password" />
            </div>

            <button type="submit" class="btn-primary">Create Account</button>

            <button type="button" class="btn-google">
              <img src="../assets/icon/goo.png" alt="Google" class="goo-icon" />
              Sign up with Google
            </button>
          </form>

          <p class="login-redirect">
            Already have account? <RouterLink to="/login">Log in</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterView',
  data() {
    return {
      form: {
        name: '',
        email: '',
        password: ''
      }
    }
  },
  methods: {
    handleRegister() {
      console.log('Registering:', this.form);
    }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  flex-direction: column;
  background-color: #e7e7e7;
  position: relative;
  overflow: hidden;
}

.register-content {
  display: flex;
  max-width: 1200px;
  margin: 60px auto;
  width: 100%;
  padding: 0 20px;
  align-items: center;
  z-index: 2;
}

.banner-section {
  flex: 1;
  display: flex;
  justify-content: center;
}

.banner-card {
  position: relative;
  width: 100%;
  max-width: 500px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.promo-img {
  width: 100%;
  display: block;
}

.form-section {
  flex: 1;
  padding-left: 80px;
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
  padding: 10px 0;
  font-size: 16px;
  outline: none;
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

.btn-primary:hover {
  background-color: #0077ee;
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
  font-size: 16px;
}

.goo-icon {
  width: 26px;
  height: 26px;
}

.login-redirect {
  margin-top: 30px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-redirect a {
  color: #000;
  font-weight: 600;
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
    opacity: 0.9;
}

@media (max-width: 992px) {
  .register-content {
    flex-direction: column;
    margin: 30px auto;
  }
  .form-section {
    padding-left: 0;
    margin-top: 40px;
    width: 100%;
  }
  .banner-section {
      display: none; /* Hide banner on smaller mobile screens if space is tight */
  }
}
</style>
