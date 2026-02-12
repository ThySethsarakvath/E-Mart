import api from './api';

/**
 * Create payment QR code
 * @param {Object} paymentData - Payment information
 * @param {number} paymentData.orderId - Order ID
 * @param {number} paymentData.amount - Total amount
 * @param {Array} paymentData.items - Order items
 * @param {Object} paymentData.customerInfo - Customer information
 */
export function createPaymentQR(paymentData) {
  return api.post('/payments/create-qr', paymentData);
}

/**
 * Check payment status
 * @param {string} transactionId - Transaction ID from QR generation
 */
export function checkPaymentStatus(transactionId) {
  return api.post('/payments/check-status', { transactionId });
}

/**
 * Get payment by order ID
 * @param {number} orderId - Order ID
 */
export function getPaymentByOrderId(orderId) {
  return api.get(`/payments/order/${orderId}`);
}

/**
 * Get payment by transaction ID
 * @param {string} transactionId - Transaction ID
 */
export function getPaymentByTransactionId(transactionId) {
  return api.get(`/payments/transaction/${transactionId}`);
}

/**
 * Simulate payment (sandbox testing only)
 * @param {string} transactionId - Transaction ID to mark as paid
 */
export function simulatePayment(transactionId) {
  return api.post('/payments/test/simulate-payment', { transactionId });
}
