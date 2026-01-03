<script>
export default {
  name: 'AboutView'
}
</script>

<template>
  <div class="mission-hero">
    <div class="hero-content">
      <h1>Our Mission and Goals</h1>
      <p>
        Our mission is to achieve meaningful goals by delivering user-friendly
        solutions, supporting our community, and growing through innovation
        and collaboration.
      </p>
    </div>
  </div>

  <div class="about-container">
    <div class="about-section">
      <h1>About Us</h1>
      <p>
        We are students of the Institute of Technology of Cambodia (ITC), developing
        this project for our Internet Programming class.
      </p>
      <p>
        Our project uses E-Mart as a case study to enhance sales performance and
        improve customer convenience by making shopping easier, faster, and more accessible.
      </p>
    </div>

    <div class="team-section">
      <h2>Our Team</h2>
      <div class="team-members">
        
        <div class="member-card">
          <img src="@/assets/sitha.png" alt="Huoth Sitha" class="member-img">
          <h3>Huoth Sitha</h3>
          <p class="role">Handles client-side functionality</p>
          
          <div class="social-links">
            <a href="https://www.facebook.com/sitha.huoth/" target="_blank"><img src="@/assets/icon/facebook.png" alt="Facebook"></a>
            <a href="mailto:huothsitha@gmail.com"><img src="@/assets/icon/email.png" alt="Email"></a>
            <a href="https://t.me/hsitha9" target="_blank"><img src="@/assets/icon/telegram.png" alt="Telegram"></a>
            <a href="https://www.linkedin.com/in/sitha-huoth" target="_blank"><img src="@/assets/icon/linkedin.png" alt="LinkedIn"></a>
            <a href="https://huothsithaportfolio.netlify.app/" target="_blank"><img src="@/assets/icon/portfolio.png" alt="Portfolio"></a>
          </div>
        </div>

        <div class="member-card">
          <img src="@/assets/vath.png" alt="Thy Sethasarakvath" class="member-img">
          <h3>Thy Sethasarakvath</h3>
          <p class="role">Manages server-side logic and database</p>
          
          <div class="social-links">
            <a href="#" target="_blank"><img src="@/assets/icon/facebook.png" alt="Facebook"></a>
            <a href="mailto:thy.sethasarakvath7547@gmail.com"><img src="@/assets/icon/email.png" alt="Email"></a>
            <a href="https://t.me/Sethasarakvath" target="_blank"><img src="@/assets/icon/telegram.png" alt="Telegram"></a>
            <a href="#" target="_blank"><img src="@/assets/icon/linkedin.png" alt="LinkedIn"></a>
            <a href="#" target="_blank"><img src="@/assets/icon/portfolio.png" alt="Portfolio"></a>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>

.mission-hero {
  background: url('@/assets/mission.png') center/cover no-repeat;
  width: 100%;
  height: 80vh;
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
}



.hero-content {
  position: relative;
  z-index: 2;
  color: white;
  padding: 20px;
  max-width: 800px;
  font-family: 'Quicksand', sans-serif;
}

.hero-content h1 {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
}

.hero-content p {
  font-size: 1.25rem;
  line-height: 1.6;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.5);
}


.about-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 60px 20px;
  font-family: 'Quicksand', sans-serif;
  color: #333;
}

.about-section {
  text-align: center;
  margin-bottom: 60px;
}

.about-section h1 {
  font-size: 2.5rem;
  margin-bottom: 25px;
  position: relative;
  display: inline-block;
}

.about-section h1::after {
  content: "";
  display: block;
  width: 60px;
  height: 4px;
  background: #3b82f6;
  margin: 10px auto 0;
  border-radius: 2px;
}

.about-section p {
  font-size: 1.1rem;
  line-height: 1.8;
  max-width: 750px;
  margin: 0 auto 20px;
  color: #555;
}


.team-section h2 {
  text-align: center;
  font-size: 2.2rem;
  margin-bottom: 40px;
}

.team-members {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 40px;
}

.member-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  width: 280px;
  text-align: center;
  border: 1px solid #eee;
  transition: transform 0.2s;
}

.member-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.member-img {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 15px;
  border: 4px solid #f8f9fa;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.member-card h3 {
  margin: 10px 0 5px;
  font-size: 1.3rem;
}

.member-card .role {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 20px;
}


.social-links {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.social-links img {
  width: 24px;
  height: 24px;
  opacity: 0.7;
  transition: opacity 0.2s, transform 0.2s;
}

.social-links a:hover img {
  opacity: 1;
  transform: scale(1.1);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .mission-hero { height: 60vh; min-height: 400px; }
  .hero-content h1 { font-size: 2.5rem; }
  .about-container { padding: 40px 20px; }
  .member-card { width: 100%; max-width: 350px; }
}
</style>