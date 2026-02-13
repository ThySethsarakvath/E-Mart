<template>
  <div class="payment-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Generating payment QR code...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h2>Payment Error</h2>
      <p>{{ error }}</p>
      <button @click="$router.push('/cart')" class="btn-secondary">
        Return to Cart
      </button>
    </div>

    <!-- Payment Success -->
    <div v-else-if="paymentStatus === 'SUCCESS'" class="success-container">
      <div class="success-icon">✅</div>
      <h2>Payment Successful!</h2>
      <p>Your payment has been processed successfully.</p>

      <!-- Receipt -->
      <div class="receipt">
        <div class="receipt-header">
          <h3>Payment Receipt</h3>
          <p class="receipt-date">{{ new Date().toLocaleString() }}</p>
        </div>

        <div class="receipt-section">
          <h4>Transaction Details</h4>
          <div class="receipt-row">
            <span class="label">Transaction ID:</span>
            <span class="value">{{ transactionId }}</span>
          </div>
          <div class="receipt-row">
            <span class="label">Order ID:</span>
            <span class="value">#{{ orderId }}</span>
          </div>
          <div class="receipt-row">
            <span class="label">Payment Method:</span>
            <span class="value">ABA KHQR</span>
          </div>
          <div class="receipt-row">
            <span class="label">Status:</span>
            <span class="value success-badge">Paid</span>
          </div>
        </div>

        <div class="receipt-section">
          <h4>Order Items</h4>
          <div v-for="item in orderItems" :key="item.id" class="receipt-item">
            <div class="item-info">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-qty">× {{ item.quantity }}</span>
            </div>
            <span class="item-price">${{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>

        <div class="receipt-section">
          <div class="receipt-row subtotal">
            <span class="label">Subtotal:</span>
            <span class="value">${{ calculateSubtotal().toFixed(2) }}</span>
          </div>
          <div class="receipt-row">
            <span class="label">Tax (10%):</span>
            <span class="value">${{ calculateTax().toFixed(2) }}</span>
          </div>
          <div class="receipt-row total">
            <span class="label">Total Paid:</span>
            <span class="value">${{ amount.toFixed(2) }}</span>
          </div>
        </div>

        <div class="receipt-footer">
          <p>Thank you for your purchase!</p>
          <p class="receipt-note">A confirmation email has been sent to your email address.</p>
        </div>
      </div>

      <div class="success-actions">
        <button @click="downloadReceipt" class="btn-primary">
          📄 Download Receipt
        </button>
        <button @click="$router.push('/')" class="btn-secondary">
          Continue Shopping
        </button>
        <button @click="$router.push('/my-orders')" class="btn-outline">
          View My Orders
        </button>
      </div>
    </div>

    <!-- QR Code Display -->
    <div v-else-if="qrData" class="qr-container">
      <div class="payment-header">
        <h2>Complete Your Payment</h2>
        <p class="subtitle">Scan the QR code with ABA Mobile or any KHQR app</p>
      </div>

      <div class="order-summary">
        <h3>Order Summary</h3>
        <div class="order-items" v-if="orderItems && orderItems.length > 0">
          <div v-for="item in orderItems" :key="item.id" class="order-item">
            <span class="item-name">{{ item.name }} × {{ item.quantity }}</span>
            <span class="item-price">${{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>
        <div class="order-total">
          <span class="total-label">Total Amount:</span>
          <span class="total-amount">${{ amount.toFixed(2) }}</span>
        </div>
      </div>

      <!-- QR Code -->
      <div class="qr-code-wrapper">
        <div class="qr-code-box">
          <!-- Display QR using the base64 image from ABA Payway -->
          <img
            v-if="qrData.qrImage"
            :src="qrData.qrImage"
            alt="Payment QR Code"
            class="qr-image"
          />
          <!-- Fallback: Generate QR from qrString if image not available -->
          <canvas
            v-else
            ref="qrCanvas"
            class="qr-canvas"
          ></canvas>
        </div>

        <div class="qr-info">
          <p class="info-text">
            <span class="info-icon">📱</span>
            Open your ABA Mobile app or any KHQR banking app
          </p>
          <p class="info-text">
            <span class="info-icon">📸</span>
            Scan the QR code above
          </p>
          <p class="info-text">
            <span class="info-icon">✓</span>
            Confirm the payment in your banking app
          </p>
        </div>

        <!-- Timer -->
        <div class="timer-container" v-if="timeRemaining > 0">
          <div class="timer-bar">
            <div class="timer-progress" :style="{ width: timerPercentage + '%' }"></div>
          </div>
          <p class="timer-text">
            QR code expires in <strong>{{ formatTime(timeRemaining) }}</strong>
          </p>
        </div>
        <div v-else class="expired-message">
          <p>⏰ QR code has expired</p>
          <button @click="regenerateQR" class="btn-primary">Generate New QR Code</button>
        </div>
      </div>

      <!-- Mobile App Links -->
      <div class="app-download" v-if="qrData.appStore || qrData.playStore">
        <p>Don't have ABA Mobile?</p>
        <div class="app-links">
          <a v-if="qrData.appStore" :href="qrData.appStore" target="_blank" class="app-link">
            <img src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg" alt="Download on App Store" />
          </a>
          <a v-if="qrData.playStore" :href="qrData.playStore" target="_blank" class="app-link">
            <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" />
          </a>
        </div>
      </div>

      <!-- Payment Status Checking -->
      <div class="payment-checking" v-if="checkingPayment">
        <div class="checking-spinner"></div>
        <p>Checking payment status...</p>
      </div>

      <!-- Manual Status Check -->
      <div class="manual-check" v-if="!checkingPayment && paymentStatus === 'PENDING'">
        <button @click="checkPaymentStatus(true)" class="btn-outline">
          Check Payment Status
        </button>
        <p class="help-text">
          Already paid? Click to verify your payment.
        </p>
      </div>

      <!-- Sandbox Simulation Button -->
      <div class="sandbox-simulation" v-if="paymentStatus === 'PENDING'">
        <div class="sandbox-notice">
          <p>🔧 <strong>Sandbox Mode:</strong> QR codes cannot be scanned with ABA Mobile in sandbox.</p>
          <p class="sandbox-hint">Use the button below to simulate a successful payment for testing.</p>
        </div>
        <button @click="simulateSuccessfulPayment" class="btn-simulate" :disabled="simulatingPayment">
          <span v-if="!simulatingPayment">✅ Simulate Successful Payment</span>
          <span v-else>Processing...</span>
        </button>
      </div>

      <!-- Cancel Payment -->
      <div class="actions">
        <button @click="cancelPayment" class="btn-cancel">
          Cancel Payment
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import QRCode from 'qrcode';
import { createPaymentQR, checkPaymentStatus as checkStatus, simulatePayment } from '../service/payment.service';
import cartService from '@/service/cart';

const router = useRouter();
const route = useRoute();

// State
const loading = ref(true);
const error = ref(null);
const qrData = ref(null);
const qrCanvas = ref(null);
const paymentStatus = ref('PENDING');
const checkingPayment = ref(false);
const simulatingPayment = ref(false);

// Order data - these would typically come from the cart/checkout
const orderId = ref(null);
const transactionId = ref(null);
const amount = ref(0);
const orderItems = ref([]);

// Timer
const timeRemaining = ref(0);
const totalTime = ref(0);
let timerInterval = null;
let statusCheckInterval = null;

// Computed
const timerPercentage = computed(() => {
  if (totalTime.value === 0) return 100;
  return (timeRemaining.value / totalTime.value) * 100;
});

// Methods
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const startTimer = (expiresIn) => {
  timeRemaining.value = expiresIn;
  totalTime.value = expiresIn;

  timerInterval = setInterval(() => {
    timeRemaining.value--;
    if (timeRemaining.value <= 0) {
      clearInterval(timerInterval);
      paymentStatus.value = 'EXPIRED';
    }
  }, 1000);
};

const generateQR = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Get order data from route params or localStorage
    const cartData = JSON.parse(localStorage.getItem('checkout_data') || '{}');

    if (!cartData.orderId || !cartData.totalAmount) {
      throw new Error('Invalid checkout data. Please go back to cart.');
    }

    orderId.value = cartData.orderId;
    amount.value = cartData.totalAmount;
    orderItems.value = cartData.items || [];

    // Create payment QR
    const response = await createPaymentQR({
      orderId: orderId.value,
      amount: amount.value,
      items: orderItems.value.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      customerInfo: {
        firstName: cartData.customerInfo?.firstName || 'Customer',
        lastName: cartData.customerInfo?.lastName || 'Guest',
        email: cartData.customerInfo?.email || '',
        phone: cartData.customerInfo?.phone || '',
      },
    });

    if (response.data.success) {
      qrData.value = response.data;
      transactionId.value = response.data.transactionId;

      // If no qrImage, generate from qrString
      if (!response.data.qrImage && response.data.qrString && qrCanvas.value) {
        await QRCode.toCanvas(qrCanvas.value, response.data.qrString, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
      }

      // Start timer
      startTimer(response.data.expiresIn || 360);

      // Start automatic status checking (every 5 seconds)
      startStatusChecking();
    } else {
      throw new Error('Failed to generate QR code');
    }
  } catch (err) {
    console.error('QR generation error:', err);
    error.value = err.response?.data?.message || err.message || 'Failed to generate payment QR code';
  } finally {
    loading.value = false;
  }
};

const checkPaymentStatus = async (isManual = false) => {
  if (!transactionId.value) return;

  try {
    if (isManual) checkingPayment.value = true;
    const response = await checkStatus(transactionId.value);

    if (response.data.success) {
      const status = String(response.data.status);

      if (status === '00' || status === '0') {
        paymentStatus.value = 'SUCCESS';
        stopStatusChecking();
        clearInterval(timerInterval);
        cartService.clearCart();
        localStorage.removeItem('checkout_data');
      }
      // If status is 11, 2, or anything else that isn't a "hard" failure, DO NOTHING.
      // This keeps the QR code visible.
      else if (status === '1' || status === '5') { // Specific ABA error codes
        paymentStatus.value = 'FAILED';
        error.value = 'Payment session expired or invalid.';
        stopStatusChecking();
      }
    }
  } catch (err) {
    console.error('Status check error:', err);
    // Don't set error.value here, or the QR will disappear on a network glitch!
  } finally {
    checkingPayment.value = false;
  }
};

const startStatusChecking = () => {
  // Check status every 5 seconds
  statusCheckInterval = setInterval(() => {
    checkPaymentStatus();
  }, 5000);
};

const stopStatusChecking = () => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval);
    statusCheckInterval = null;
  }
};

const regenerateQR = () => {
  stopStatusChecking();
  clearInterval(timerInterval);
  generateQR();
};

const simulateSuccessfulPayment = async () => {
  if (!transactionId.value) {
    error.value = 'No transaction ID found';
    return;
  }

  try {
    simulatingPayment.value = true;

    console.log('Simulating payment for transaction:', transactionId.value);

    // Call the simulate endpoint
    const response = await simulatePayment(transactionId.value);

    if (response.data.success) {
      // Wait a bit for the backend to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check the actual status
      await checkPaymentStatus(true);

      // If still pending after check, force success for testing
      if (paymentStatus.value !== 'SUCCESS') {
        paymentStatus.value = 'SUCCESS';
        stopStatusChecking();
        clearInterval(timerInterval);

        // Clear checkout data
        cartService.clearCart();
        localStorage.removeItem('checkout_data');
      }
    }
  } catch (err) {
    console.error('Simulation error:', err);
    error.value = 'Failed to simulate payment: ' + (err.response?.data?.message || err.message);
  } finally {
    simulatingPayment.value = false;
  }
};

const calculateSubtotal = () => {
  return orderItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

const calculateTax = () => {
  return calculateSubtotal() * 0.10;
};

const downloadReceipt = () => {
  // Create a printable receipt
  const receiptContent = `
==============================================
           PAYMENT RECEIPT
==============================================

Date: ${new Date().toLocaleString()}
Transaction ID: ${transactionId.value}
Order ID: #${orderId.value}
Payment Method: ABA KHQR
Status: PAID

----------------------------------------------
ORDER ITEMS
----------------------------------------------
${orderItems.value.map(item =>
  `${item.name} x ${item.quantity}  $${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

----------------------------------------------
Subtotal:        $${calculateSubtotal().toFixed(2)}
Tax (10%):       $${calculateTax().toFixed(2)}
----------------------------------------------
TOTAL PAID:      $${amount.value.toFixed(2)}
==============================================

Thank you for your purchase!

==============================================
  `;

  // Create blob and download
  const blob = new Blob([receiptContent], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `receipt-${transactionId.value}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const cancelPayment = () => {
  if (confirm('Are you sure you want to cancel this payment?')) {
    stopStatusChecking();
    clearInterval(timerInterval);
    localStorage.removeItem('checkout_data');
    router.push('/cart');
  }
};

// Lifecycle
onMounted(() => {
  generateQR();
});

onUnmounted(() => {
  stopStatusChecking();
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});
</script>

<style scoped>
.payment-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* Loading */
.loading-container {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #003d82;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error */
.error-container {
  text-align: center;
  padding: 3rem 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-container h2 {
  color: #d32f2f;
  margin-bottom: 1rem;
}

/* Success */
.success-container {
  text-align: center;
  padding: 3rem 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.success-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.success-container h2 {
  color: #2e7d32;
  margin-bottom: 1rem;
}

.payment-details {
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 2rem 0;
  text-align: left;
}

.payment-details p {
  margin: 0.5rem 0;
  color: #555;
}

/* QR Container */
.qr-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.payment-header {
  text-align: center;
  margin-bottom: 2rem;
}

.payment-header h2 {
  color: #003d82;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 0.95rem;
}

/* Order Summary */
.order-summary {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.order-summary h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.order-items {
  margin-bottom: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.item-name {
  color: #555;
}

.item-price {
  font-weight: 600;
  color: #333;
}

.order-total {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 2px solid #003d82;
  font-size: 1.2rem;
  font-weight: 700;
}

.total-label {
  color: #333;
}

.total-amount {
  color: #003d82;
}

/* QR Code */
.qr-code-wrapper {
  text-align: center;
}

.qr-code-box {
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.qr-image {
  max-width: 300px;
  height: auto;
  display: block;
}

.qr-canvas {
  display: block;
}

/* QR Info */
.qr-info {
  text-align: left;
  max-width: 400px;
  margin: 0 auto 2rem;
}

.info-text {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: #f5f5f5;
  border-radius: 8px;
  color: #555;
}

.info-icon {
  font-size: 1.5rem;
}

/* Timer */
.timer-container {
  max-width: 400px;
  margin: 2rem auto;
}

.timer-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.timer-progress {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 1s linear;
}

.timer-text {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.expired-message {
  padding: 1.5rem;
  background: #fff3cd;
  border-radius: 8px;
  margin: 2rem 0;
}

.expired-message p {
  margin-bottom: 1rem;
  color: #856404;
}

/* App Download */
.app-download {
  text-align: center;
  padding: 2rem 0;
  border-top: 1px solid #e0e0e0;
  margin-top: 2rem;
}

.app-download p {
  margin-bottom: 1rem;
  color: #666;
}

.app-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.app-link img {
  height: 50px;
  width: auto;
}

/* Payment Checking */
.payment-checking {
  text-align: center;
  padding: 1.5rem;
  background: #e3f2fd;
  border-radius: 8px;
  margin: 1.5rem 0;
}

.checking-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #bbdefb;
  border-top: 3px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 0.5rem;
}

/* Manual Check */
.manual-check {
  text-align: center;
  padding: 1.5rem 0;
}

.help-text {
  color: #666;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

/* Actions */
.actions {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
}

/* Buttons */
.btn-primary,
.btn-secondary,
.btn-outline,
.btn-cancel {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0.5rem;
}

.btn-primary {
  background: #003d82;
  color: #fff;
}

.btn-primary:hover {
  background: #002a5c;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 61, 130, 0.3);
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-outline {
  background: transparent;
  color: #003d82;
  border: 2px solid #003d82;
}

.btn-outline:hover {
  background: #003d82;
  color: #fff;
}

.btn-cancel {
  background: transparent;
  color: #d32f2f;
  border: 1px solid #d32f2f;
}

.btn-cancel:hover {
  background: #d32f2f;
  color: #fff;
}

/* Sandbox Simulation */
.sandbox-simulation {
  background: #fff3cd;
  border: 2px dashed #856404;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 2rem 0;
  text-align: center;
}

.sandbox-notice {
  margin-bottom: 1rem;
}

.sandbox-notice p {
  color: #856404;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.sandbox-notice strong {
  font-weight: 700;
}

.sandbox-hint {
  font-size: 0.85rem;
  opacity: 0.8;
}

.btn-simulate {
  background: #28a745;
  color: white;
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2);
}

.btn-simulate:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-simulate:disabled {
  background: #94d3a2;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Receipt Styles */
.receipt {
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.receipt-header {
  text-align: center;
  padding-bottom: 1.5rem;
  border-bottom: 2px dashed #ccc;
  margin-bottom: 1.5rem;
}

.receipt-header h3 {
  margin: 0 0 0.5rem 0;
  color: #003d82;
  font-size: 1.5rem;
}

.receipt-date {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.receipt-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.receipt-section:last-of-type {
  border-bottom: 2px dashed #ccc;
}

.receipt-section h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.95rem;
}

.receipt-row .label {
  color: #666;
}

.receipt-row .value {
  color: #333;
  font-weight: 500;
}

.receipt-row.subtotal {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.receipt-row.total {
  font-size: 1.2rem;
  font-weight: 700;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
}

.receipt-row.total .value {
  color: #003d82;
}

.success-badge {
  background: #d4edda;
  color: #155724;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.85rem;
}

.receipt-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.receipt-item:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  color: #333;
  font-weight: 500;
}

.item-qty {
  color: #666;
  font-size: 0.85rem;
}

.item-price {
  color: #003d82;
  font-weight: 600;
}

.receipt-footer {
  text-align: center;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.receipt-footer p {
  margin: 0.5rem 0;
  color: #666;
}

.receipt-note {
  font-size: 0.85rem;
  font-style: italic;
}

.success-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .payment-container {
    padding: 1rem;
  }

  .qr-code-box {
    padding: 1rem;
  }

  .qr-image {
    max-width: 250px;
  }

  .app-links {
    flex-direction: column;
    align-items: center;
  }
}
</style>
