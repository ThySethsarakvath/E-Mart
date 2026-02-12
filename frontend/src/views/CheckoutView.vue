<template>
  <div class="checkout-container">
    <div class="checkout-content">
      
      <div class="billing-section">
        
        <div class="method-section">
          <h2>How would you like to get your order?</h2>
          <div class="method-options">
            <div 
              class="method-card" 
              :class="{ active: deliveryMethod === 'delivery' }"
              @click="deliveryMethod = 'delivery'"
            >
              <div class="method-header">
                <input type="radio" value="delivery" v-model="deliveryMethod">
                <span>Delivery</span>
              </div>
              <p class="method-desc">We bring it to your door.</p>
            </div>

            <div 
              class="method-card" 
              :class="{ active: deliveryMethod === 'pickup' }"
              @click="deliveryMethod = 'pickup'"
            >
              <div class="method-header">
                <input type="radio" value="pickup" v-model="deliveryMethod">
                <span>Pick Up</span>
              </div>
              <p class="method-desc">Come to our store (No Fee).</p>
            </div>
          </div>
        </div>

        <div v-if="deliveryMethod === 'delivery'" class="address-form fade-in">
          <h2>Delivery Address</h2>
          <form @submit.prevent="handlePlaceOrder">
            <div class="form-grid">
              <div class="input-group">
                <label>First Name<span class="required">*</span></label>
                <input type="text" v-model="form.firstName" required class="input-field" />
              </div>
              <div class="input-group full-width">
                <label>Street Address<span class="required">*</span></label>
                <input type="text" v-model="form.address" required class="input-field" placeholder="House number, Street name" />
              </div>
              <div class="input-group">
                <label>Town/City<span class="required">*</span></label>
                <input type="text" v-model="form.city" required class="input-field" />
              </div>
              <div class="input-group">
                <label>Phone Number<span class="required">*</span></label>
                <input type="tel" v-model="form.phone" required class="input-field" />
              </div>
            </div>
          </form>
        </div>

        <div v-else class="pickup-info fade-in">
          <h2>Pick Up Details</h2>
          <div class="info-box">
             <p><strong>Store Location:</strong> Russian Blvd, ITC Campus, Phnom Penh.</p>
             <p><strong>Contact:</strong> 012 345 678</p>
             <p class="note">Please bring your Order ID when you come to collect.</p>
             
             <div class="input-group" style="margin-top: 15px;">
                <label>Your Phone Number<span class="required">*</span></label>
                <input type="tel" v-model="form.phone" required class="input-field" />
             </div>
          </div>
        </div>

      </div>

      <div class="order-summary-section">
        <div class="summary-card">
          <h3>Order Summary</h3>
          
          <div class="product-list">
            <div v-for="item in cartItems" :key="item.id" class="summary-item">
              <div class="item-info">
                <img :src="getImgUrl(item.imagePath)" :alt="item.name" class="item-thumb" />
                <span class="item-name">{{ item.name }} (x{{ item.quantity }})</span>
              </div>
              <span class="item-total">${{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>

          <div class="totals-row">
            <span>Subtotal:</span>
            <span>${{ cartTotal.toFixed(2) }}</span>
          </div>

          <div class="totals-row">
            <span>Shipping:</span>
            <span :class="{ 'free-text': shippingCost === 0 }">
              {{ shippingCost === 0 ? '$0.00' : '$' + shippingCost.toFixed(2) }}
            </span>
          </div>

          <div class="totals-row grand-total">
            <span>Total:</span>
            <span>${{ grandTotal.toFixed(2) }}</span>
          </div>

          <div class="payment-methods">
            <h4>Payment Method</h4>
            
            <div v-if="deliveryMethod === 'delivery'" class="fade-in">
              
              <div class="payment-option">
                <input type="radio" id="stripe" value="stripe" v-model="paymentMethod" />
                <label for="stripe" class="payment-label">
                  <span>Credit/Debit Card</span>
                  <div class="bank-icons">
                                            <img src="@/assets/paymentimg/mastercard.png" alt="Mastercard" />
                    <img src="@/assets/paymentimg/visa.png" alt="Visa" />

                    </div>
                </label>
              </div>

              <div v-show="paymentMethod === 'stripe'" class="stripe-box fade-in">
                 <div id="card-element"></div>
                 <div id="card-errors" class="stripe-error"></div>
              </div>

              <div class="payment-option">
                <input type="radio" id="bank" value="bank" v-model="paymentMethod" />
                <label for="bank" class="payment-label">
                  <span>Bank Transfer</span>
                  <div class="bank-icons">
                    <img src="@/assets/paymentimg/khqr.png" alt="KHQR" />
                  </div>
                </label>
              </div>
              
              <div class="payment-option">
                <input type="radio" id="cod" value="cod" v-model="paymentMethod" />
                <label for="cod" class="payment-label">Cash on Delivery</label>
              </div>
            </div>

            <div v-else class="fade-in">
              <div class="payment-option">
                <input type="radio" id="store" value="pay_store" v-model="paymentMethod" disabled />
                <label for="store" class="payment-label">Pay at Store</label>
              </div>
            </div>

          </div>

          <button @click="handlePlaceOrder" class="btn-place-order" :disabled="cartItems.length === 0 || loading">
            {{ loading ? 'Processing...' : 'Confirm Order' }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import cartService from '../service/cart.js';
import authService from '../auth/auth.service.js';
import { loadStripe } from '@stripe/stripe-js';

export default {
  name: 'CheckoutView',
  data() {
    return {
      deliveryMethod: 'delivery',
      form: {
        firstName: '',
        address: '',
        city: '',
        phone: '',
        email: ''
      },
      paymentMethod: 'cod', // Default
      loading: false,
      stripe: null,
      elements: null,
      card: null
    };
  },
  watch: {
    deliveryMethod(newVal) {
      if (newVal === 'pickup') {
        this.paymentMethod = 'pay_store';
      } else {
        this.paymentMethod = 'cod';
      }
    },
    // Initialize Stripe when user selects the option
    paymentMethod(newVal) {
      if (newVal === 'stripe') {
        this.$nextTick(() => {
          this.initStripe();
        });
      }
    }
  },
  computed: {
    cartItems() {
      return cartService.state.items;
    },
    cartTotal() {
      return cartService.state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    shippingCost() {
      if (this.deliveryMethod === 'pickup') return 0;
      if (this.cartTotal >= 20) return 0;
      return 2.00;
    },
    grandTotal() {
      return this.cartTotal + this.shippingCost;
    }
  },
  created() {
    const user = authService.getCurrentUser();
    if (user) {
      this.form.firstName = user.firstName || '';
      this.form.email = user.email || '';
    }
  },
  methods: {
    getImgUrl(path) {
      return `http://localhost:4000/uploads/products/${path}`;
    },
    async initStripe() {
      if (this.card) return; // Prevent re-initialization

      // ⚠️ REPLACE THIS WITH YOUR STRIPE PUBLISHABLE KEY (pk_test_...)
      this.stripe = await loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx'); 
      this.elements = this.stripe.elements();
      
      const style = {
        base: {
          color: '#32325d',
          fontFamily: '"Quicksand", sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': { color: '#aab7c4' }
        },
        invalid: { color: '#fa755a', iconColor: '#fa755a' }
      };

      this.card = this.elements.create('card', { style });
      this.card.mount('#card-element');
    },
    async handlePlaceOrder() {
      if (this.cartItems.length === 0) return alert('Your cart is empty!');
      if (!this.form.phone) return alert('Phone number is required.');

      if (this.deliveryMethod === 'delivery') {
        if (!this.form.address || !this.form.city) return alert('Please fill in your address.');
      }

      this.loading = true;

      // 1. Handle Stripe Payment
      if (this.paymentMethod === 'stripe') {
        // Logic: Call your backend to get clientSecret, then confirmCardPayment
        // For now, we simulate basic validation
        const result = await this.stripe.createToken(this.card);
        if (result.error) {
           alert(result.error.message);
           this.loading = false;
           return;
        }
        console.log('Stripe Token:', result.token);
        // Add token to orderData below...
      }

      // 2. Prepare Data
      const orderData = {
        customer: this.form,
        items: this.cartItems,
        deliveryMethod: this.deliveryMethod,
        shippingFee: this.shippingCost,
        total: this.grandTotal,
        paymentMethod: this.paymentMethod,
        date: new Date().toISOString()
      };

      console.log('Sending Order:', orderData);
      
      // Simulate API delay
      setTimeout(() => {
        alert(`Order Placed Successfully! (${this.paymentMethod.toUpperCase()})`);
        cartService.clearCart();
        this.$router.push('/');
        this.loading = false;
      }, 1000);
    }
  }
}
</script>

<style scoped>
.checkout-container { 
  padding: 160px 0 60px; /* Space from header */
  max-width: 1170px; 
  margin: 0 auto; 
  background-color: #f9f9f9; 
}
.checkout-content { display: flex; gap: 40px; flex-wrap: wrap; padding: 0 20px; }

.billing-section { flex: 1.5; min-width: 300px; }
.order-summary-section { flex: 1; min-width: 300px; }

h2, h3, h4 { font-weight: 600; margin-bottom: 20px; color: #333; }

/* Delivery Method Cards */
.method-options { display: flex; gap: 15px; margin-bottom: 30px; }
.method-card { 
  flex: 1; 
  background: #ffffff;
  border: 1px solid #e0e0e0; 
  border-radius: 8px; 
  padding: 15px; 
  cursor: pointer; 
  transition: all 0.3s; 
}
.method-card:hover { border-color: #0d6efd; }
.method-card.active { 
  border-color: #0d6efd; 
  background-color: #f0f7ff; 
  box-shadow: 0 0 0 1px #0d6efd inset; 
}
.method-header { display: flex; align-items: center; gap: 10px; font-weight: bold; margin-bottom: 5px; }
.method-desc { font-size: 13px; color: #666; margin-left: 24px; }

/* Forms */
.form-grid { display: grid; gap: 15px; }
.input-group { display: flex; flex-direction: column; }
.input-group label { margin-bottom: 5px; font-size: 14px; font-weight: 500; }
.required { color: #0d6efd; margin-left: 3px; }
.input-field { 
  background: #ffffff;
  border: 1px solid #d0d0d0;
  padding: 12px; 
  border-radius: 4px; 
  outline: none; 
  font-size: 14px;
  transition: border-color 0.2s;
}
.input-field:focus { border-color: #0d6efd; box-shadow: 0 0 0 3px rgba(13,110,253,0.1); }

/* Pickup Info */
.pickup-info .info-box { 
  background: #fff; 
  padding: 20px; 
  border-radius: 8px; 
  border: 1px solid #eee; 
  border-left: 4px solid #0d6efd; 
}
.note { font-size: 12px; color: #666; margin-top: 10px; }

/* Summary */
.summary-card { 
  background: #ffffff;
  padding: 25px; 
  border: 1px solid #e0e0e0; 
  border-radius: 8px; 
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}

.summary-item { display: flex; justify-content: space-between; margin-bottom: 15px; align-items: center; }
.item-thumb { width: 50px; height: 50px; object-fit: contain; margin-right: 10px; border-radius: 4px; border: 1px solid #eee; }
.totals-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
.grand-total { font-weight: bold; font-size: 18px; border-bottom: none; margin-top: 10px; color: #0d6efd; }
.free-text { color: #0d6efd; font-weight: bold; }

/* Payment */
.payment-methods { margin-top: 20px; }
.payment-option { display: flex; align-items: center; margin-bottom: 15px; } /* Added spacing */
.payment-label { display: flex; justify-content: space-between; width: 100%; cursor: pointer; margin-left: 10px; align-items: center; }
.bank-icons img { height: 24px; margin-left: 5px; } /* Slightly larger icons */

/* Stripe Box */
.stripe-box {
  margin: 10px 0 20px 24px; /* Indent to align with radio label */
  padding: 15px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
.stripe-error {
  color: #db4444;
  font-size: 13px;
  margin-top: 5px;
}

/* Button */
.btn-place-order { 
  width: 100%; 
  padding: 16px; 
  background: #0d6efd; 
  color: white; 
  border: none; 
  border-radius: 4px; 
  font-size: 16px; 
  font-weight: 600;
  margin-top: 20px; 
  cursor: pointer; 
  transition: all 0.3s ease;
}
.btn-place-order:hover { background: #0b5ed7; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(13, 110, 253, 0.2); }
.btn-place-order:disabled { background: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }

.fade-in { animation: fadeIn 0.3s ease-in; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 768px) { .checkout-content { flex-direction: column; } }
</style>