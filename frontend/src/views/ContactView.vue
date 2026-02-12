<script>
import BreadcrumbComponent from '@/components/BreadcrumbComponent.vue';
import emailjs from '@emailjs/browser';
import authService from '@/auth/auth.service';

export default {
  name: 'ContactView',
  components: {
    BreadcrumbComponent
  },
  data() {
    return {
      form: {
        name: '',
        email: '',
        subject: '', 
        message: ''
      },
      loading: false,
      submitted: false,
      errorMessage: '',
      isLoggedIn: false,      
      showLoginModal: false  
    }
  },
  mounted() {
    
    const user = authService.getCurrentUser();
    
    if (user) {
      this.isLoggedIn = true;
      
      
      const fullName = user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName;

      this.form.name = fullName;
      this.form.email = user.email;
    } else {
     
      this.isLoggedIn = false;
      this.showLoginModal = true;
    }
  },
  methods: {
    goToLogin() {
      this.$router.push('/login');
    },
    async handleContact() {
      if (!this.isLoggedIn) {
        this.showLoginModal = true;
        return;
      }

      this.loading = true;
      this.errorMessage = '';

      const serviceID = 'service_cure154';   
      const templateID = 'template_pntrodx'; 
      const publicKey = '8SeH6dnaP1i0q7xRM';   

      const templateParams = {
        name: this.form.name,
        email: this.form.email,
        subject: this.form.subject, 
        message: this.form.message
      };

      try {
        const response = await emailjs.send(
          serviceID,
          templateID,
          templateParams,
          publicKey
        );

        console.log('SUCCESS!', response.status, response.text);
        this.submitted = true;
        
        
        this.form.subject = '';
        this.form.message = '';

      } catch (error) {
        console.error('FAILED...', error);
        this.errorMessage = "Failed to send message. Please try again later.";
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<template>
  <div class="contact-page">
    <div class="container">
      <BreadcrumbComponent />

      <div class="contact-wrapper">
        
        <div class="contact-info-card">
          <div class="info-item">
            <div class="icon-box black-bg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <div>
              <h3>Call To Us</h3>
              <p>We are available 24/7, 7 days a week.</p>
              <p class="highlight">Phone: +855 95 490 904</p>
              <p class="highlight">Phone: +855 96 933 7547</p>
            </div>
          </div>

          <hr class="divider" />

          <div class="info-item">
            <div class="icon-box black-bg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <div>
              <h3>Write To Us</h3>
              <p>we provides team support to check your message Fill out our form and we'll contact you within 24 hours.</p>
              <p class="highlight">Emails: thy.sethasarakvath7547@gmail.com</p>
              <p class="highlight">Emails: huothsitha@gmail.com</p>
              <p class="highlight">Represented by E-mart team</p>
            </div>
          </div>
        </div>

        <div class="contact-form-card">
          <div v-if="submitted" class="success-banner">
            <div class="success-icon">✓</div>
            <h3>Message Sent!</h3>
            <p>Thank you for contacting us. We will get back to you shortly.</p>
            <button class="btn-reset" @click="submitted = false">Send another message</button>
          </div>

          <form v-else @submit.prevent="handleContact">
            <div class="input-row">
              <input 
                type="text" 
                placeholder="Your Name" 
                v-model="form.name" 
                readonly 
                class="locked-input"
                :disabled="!isLoggedIn"
              />
              <input 
                type="email" 
                placeholder="Your Email" 
                v-model="form.email" 
                readonly 
                class="locked-input"
                :disabled="!isLoggedIn"
              />
              
              <select v-model="form.subject" required :disabled="!isLoggedIn">
                <option value="" disabled selected>Select Subject</option>
                <option value="General Inquiry">General Inquiry</option>
                <option value="Feedback">Feedback</option>
                <option value="Report a Bug">Report a Bug</option>
                <option value="Order Issue">Order Issue</option>
              </select>
            </div>
            
            <div class="textarea-wrapper">
              <textarea 
                placeholder="Your Message" 
                rows="8" 
                v-model="form.message" 
                required 
                :disabled="!isLoggedIn"
              ></textarea>
            </div>

            <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>

            <div class="form-footer">
              <button type="submit" class="btn-send" :disabled="loading || !isLoggedIn">
                {{ loading ? 'Sending...' : 'Send Message' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showLoginModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-icon">🔒</div>
        <h2>Login Required</h2>
        <p>Before sending us a message, you must log in to your account.</p>
        <div class="modal-actions">
          <button class="btn-modal-login" @click="goToLogin">Log In Now</button>
          <button class="btn-modal-close" @click="showLoginModal = false">View Page Only</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.contact-page { padding: 40px 0 80px; background-color: transparent; min-height: 80vh; font-family: 'Quicksand', sans-serif; }
.container { max-width: 1170px; margin: 0 auto; padding: 0 20px; }
.contact-wrapper { display: flex; gap: 30px; margin-top: 20px; }
.contact-info-card { flex: 1.3; background: white; padding: 40px 35px; border-radius: 4px; box-shadow: 0 1px 13px rgba(0,0,0,0.05); border: 1px solid #0b5ed7; height: fit-content; }
.contact-form-card { flex: 2; background: white; padding: 40px; border-radius: 4px; box-shadow: 0 1px 13px rgba(0,0,0,0.05); border: 1px solid #0d6efd; }
.info-item { display: flex; align-items: flex-start; gap: 16px; }
.icon-box { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
.icon-box.black-bg { background-color: #000000; }
.info-item h3 { font-size: 16px; font-weight: 600; margin: 8px 0; }
.info-item p { font-size: 14px; color: #333; margin-bottom: 5px; line-height: 1.5; word-break: break-all; }
.highlight { font-weight: 500; }
.divider { border: 0; border-top: 1px solid #e0e0e0; margin: 30px 0; }
.input-row { display: flex; gap: 16px; margin-bottom: 16px; }

.input-row input, 
.input-row select { flex: 1; background: #f5f5f5; border: none; padding: 15px; border-radius: 4px; outline: none; font-size: 14px; font-family: 'Quicksand', sans-serif; }
.locked-input { background-color: #e9ecef !important; color: #6c757d; cursor: not-allowed; border: 1px solid #dee2e6; }
.input-row select { color: #555; cursor: pointer; }
.textarea-wrapper textarea { width: 100%; background: #f5f5f5; border: none; padding: 15px; border-radius: 4px; outline: none; resize: none; font-family: inherit; font-size: 14px; }
.form-footer { display: flex; justify-content: flex-end; margin-top: 24px; }

.btn-send { background-color: #0d6efd; color: white; border: none; padding: 16px 48px; border-radius: 4px; font-weight: 500; cursor: pointer; transition: background 0.2s; font-size: 16px; }
.btn-send:hover { background-color: #0b5ed7; }
.btn-send:disabled { background-color: #ccc; cursor: not-allowed; }

.success-banner { text-align: center; padding: 40px; display: flex; flex-direction: column; align-items: center; }
.success-icon { width: 60px; height: 60px; background: #2ecc71; color: white; border-radius: 50%; font-size: 30px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
.success-banner h3 { font-size: 24px; margin-bottom: 10px; color: #333; }
.btn-reset { margin-top: 20px; background: none; border: 1px solid #ccc; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
.error-msg { color: #e74c3c; margin-top: 10px; font-size: 14px; }


.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Semi-transparent black */
  display: flex; justify-content: center; align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px); /* Nice blur effect */
}

.modal-content {
  background: white;
  padding: 40px;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  animation: popIn 0.3s ease-out;
}

@keyframes popIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-icon { font-size: 40px; margin-bottom: 20px; }
.modal-content h2 { margin-bottom: 10px; color: #333; }
.modal-content p { color: #666; margin-bottom: 30px; line-height: 1.5; }

.modal-actions { display: flex; flex-direction: column; gap: 10px; }

.btn-modal-login {
  background: #0d6efd; color: white; border: none; padding: 12px;
  border-radius: 4px; font-weight: 600; cursor: pointer;
  font-size: 16px;
}
.btn-modal-login:hover { background: #0b5ed7; }

.btn-modal-close {
  background: transparent; color: #666; border: 1px solid #ccc;
  padding: 12px; border-radius: 4px; cursor: pointer;
  font-size: 14px;
}
.btn-modal-close:hover { background: #f5f5f5; color: #333; }

@media (max-width: 992px) {
  .contact-wrapper { flex-direction: column; }
  .input-row { flex-direction: column; }
}
</style>