<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="footer-wrapper">
    <div class="footer-artwork">
      <img src="@/assets/footer.png" alt="" />
    </div>

    <footer class="footer">
      <div class="footer-content">
        <section class="brand-section">
          <RouterLink to="/" class="footer-logo" aria-label="E-Mart home">
            <img src="@/assets/logo.png" alt="E-Mart" />
            <span>
              <strong>E-Mart</strong>
              <small>Your everyday marketplace</small>
            </span>
          </RouterLink>
          <p>
            Quality products, straightforward shopping, and dependable support—all in one
            convenient place.
          </p>
          <div class="trust-row">
            <span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              Secure shopping
            </span>
            <span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7zM6 19h.01M18 19h.01"></path>
              </svg>
              Local delivery
            </span>
          </div>
        </section>

        <section class="footer-section">
          <h3>Explore</h3>
          <nav class="footer-links" aria-label="Footer explore links">
            <RouterLink to="/">Home</RouterLink>
            <RouterLink to="/products">All products</RouterLink>
            <RouterLink to="/about">About E-Mart</RouterLink>
            <RouterLink to="/contact">Contact us</RouterLink>
          </nav>
        </section>

        <section class="footer-section">
          <h3>My account</h3>
          <nav class="footer-links" aria-label="Footer account links">
            <RouterLink to="/cart">Shopping cart</RouterLink>
            <RouterLink to="/wishlist">Wishlist</RouterLink>
            <RouterLink to="/my-orders">My orders</RouterLink>
            <RouterLink to="/login">Sign in</RouterLink>
          </nav>
        </section>

        <section class="footer-section contact-section">
          <h3>Get in touch</h3>
          <a
            class="contact-item"
            href="https://maps.google.com/?q=Phnom+Penh+Cambodia"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="contact-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"></path>
                <circle cx="12" cy="10" r="2.5"></circle>
              </svg>
            </span>
            <span><small>Visit us</small>Phnom Penh, Cambodia</span>
          </a>
          <a class="contact-item" href="tel:+85595490904">
            <span class="contact-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 5.2 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L9 11a16 16 0 0 0 4 4l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"></path>
              </svg>
            </span>
            <span><small>Call us</small>+855 95 490 904</span>
          </a>
          <a class="contact-item" href="mailto:emartcambodia@gmail.com">
            <span class="contact-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                <path d="m4 7 8 6 8-6"></path>
              </svg>
            </span>
            <span><small>Email us</small>emartcambodia@gmail.com</span>
          </a>
        </section>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} E-Mart. All rights reserved.</p>
        <p>Made for convenient shopping in Cambodia.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.footer-wrapper {
  overflow: hidden;
  width: 100%;
  background: #e7e7e7;
}

.footer-artwork {
  position: relative;
  max-width: 1500px;
  margin: 0 auto -1px;
}

.footer-artwork::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 34%;
  /* background: linear-gradient(to bottom, transparent, #ffffff); */
  content: '';
  pointer-events: none;
}

.footer-artwork img {
  display: block;
  width: 100%;
  height: auto;
}

.footer {
  position: relative;
  padding: 62px 24px 22px;
  border-top: 2px solid #e2e8f0;
  background: #ffffff;
  color: #334155;
}

.footer::before {
  position: absolute;
  top: 0;
  left: 50%;
  width: min(1500px, 100%);
  height: 3px;
  background: linear-gradient(90deg, transparent, #0d6efd, transparent);
  content: '';
  opacity: 0.65;
  transform: translateX(-50%);
}

.footer-content {
  display: grid;
  max-width: 1280px;
  grid-template-columns: 1.65fr 0.75fr 0.85fr 1.35fr;
  gap: 52px;
  margin: 0 auto 48px;
}

.footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  color: inherit;
  text-decoration: none;
}

.footer-logo img {
  width: 58px;
  height: 58px;
  object-fit: contain;
}

.footer-logo > span {
  display: flex;
  flex-direction: column;
}

.footer-logo strong {
  color: #172033;
  font-size: 20px;
}

.footer-logo small {
  margin-top: 2px;
  color: #0d6efd;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.brand-section > p {
  max-width: 390px;
  margin: 18px 0 22px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.8;
}

.trust-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.trust-row span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
}

.trust-row svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: #0d6efd;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.footer-section h3 {
  position: relative;
  margin: 8px 0 22px;
  color: #172033;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.footer-section h3::after {
  display: block;
  width: 28px;
  height: 2px;
  margin-top: 8px;
  border-radius: 999px;
  background: #0d6efd;
  content: '';
}

.footer-links {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 13px;
}

.footer-links a {
  position: relative;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease, transform 0.2s ease;
}

.footer-links a:hover {
  color: #0d6efd;
  transform: translateX(3px);
}

.contact-section {
  min-width: 0;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 12px;
  color: #475569;
  text-decoration: none;
  transition: color 0.2s ease;
}

.contact-item:hover {
  color: #0d6efd;
}

.contact-icon {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  place-items: center;
  border: 1px solid #dbe7f8;
  border-radius: 10px;
  background: #f4f8ff;
  color: #0d6efd;
}

.contact-icon svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.contact-item > span:last-child {
  min-width: 0;
  overflow: hidden;
  font-size: 11px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-item small {
  display: block;
  margin-bottom: 2px;
  color: #94a3b8;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.footer-bottom {
  display: flex;
  max-width: 1280px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 0 auto;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  color: #94a3b8;
  font-size: 10px;
}

.footer-bottom p {
  margin: 0;
}

@media (max-width: 1000px) {
  .footer-content {
    grid-template-columns: 1.4fr 0.8fr 0.8fr;
  }

  .contact-section {
    grid-column: 1 / -1;
  }
}

@media (max-width: 680px) {
  .footer {
    padding: 48px 20px 20px;
  }

  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 38px 24px;
  }

  .brand-section,
  .contact-section {
    grid-column: 1 / -1;
  }

  .footer-bottom {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
