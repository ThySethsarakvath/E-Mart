<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>E-Mart</h3>
        <p>Your one-stop shop for everything you need. Quality products, fast delivery, and excellent support.</p>
      </div>
      
      <div class="footer-section">
        <h3>Quick Links</h3>
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/about">About Us</router-link></li>
          <li><router-link to="/products">Products</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h3>Contact</h3>
        
        <div class="contact-item">
          <img src="@/assets/icon/location.png" alt="Location" class="icon" />
          <span>Phnom Penh, Cambodia</span>
        </div>

        <div class="contact-item">
          <img src="@/assets/icon/phone.png" alt="Phone" class="icon" />
          <span>+855 95490904</span>
        </div>

        <div class="contact-item">
          <img src="@/assets/icon/mail.png" alt="Email" class="icon" />
          <span>Emartcambodia@gmail.coltd</span>
        </div>
      </div>

    </div>

    <div class="footer-bottom">
      <p>&copy; 2024 E-Mart. All rights reserved.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterComponent'
}
</script>

<style scoped>
.footer {
  background-color: #ffffff; 
  color: #333; 
  padding: 60px 20px 20px;
  margin-top: auto;
  border-top: 1px solid #ececec; 
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-section h3 {
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: #0d6efd; 
  font-weight: 700;
}

.footer-section p {
  line-height: 1.6;
  color: #7e7e7e; 
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 10px;
}

.footer-section ul li a {
  color: #253d4e; 
  text-decoration: none;
  transition: 0.3s;
  font-weight: 500;
}

.footer-section ul li a:hover {
  color: #0d6efd;
}


.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  color: #7e7e7e;
}

.icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.footer-bottom {
  border-top: 1px solid #ececec;
  text-align: center;
  padding-top: 20px;
  color: #7e7e7e;
  font-size: 0.9rem;
}
</style>