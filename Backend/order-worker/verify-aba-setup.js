/**
 * ABA Payway Setup Verification Script
 *
 * Usage:
 * 1. Copy your .env.configured to .env
 * 2. Run: node verify-aba-setup.js
 */

const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

// Configuration
const MERCHANT_ID = process.env.PAYWAY_MERCHANT_ID || 'REMOVED_SECRET';
const API_KEY = process.env.PAYWAY_API_KEY || 'REMOVED_SECRET';
const SANDBOX_URL = process.env.PAYWAY_SANDBOX_URL || 'https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1';

console.log('🔍 ABA Payway Setup Verification\n');
console.log('Configuration:');
console.log(`  Merchant ID: ${MERCHANT_ID}`);
console.log(`  API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 10)}`);
console.log(`  Sandbox URL: ${SANDBOX_URL}\n`);

// Generate HMAC-SHA512 hash
function generateHash(data) {
  const hmac = crypto.createHmac('sha512', API_KEY);
  hmac.update(data);
  return hmac.digest('base64');
}

// Generate unique transaction ID (≤ 20 chars)
function generateTransactionId() {
  const now = new Date();
  const timestamp =
    now.getFullYear().toString().slice(-2) +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return timestamp + random; // 16 chars
}

// Base64 encode items
function encodeItems(items) {
  return Buffer.from(JSON.stringify(items)).toString('base64');
}

async function testQRGeneration() {
  try {
    console.log('📝 Generating test QR code...\n');

    const tranId = generateTransactionId();
    const reqTime = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);

    const amount = 1.00;
    const items = [{ name: 'Test Product', quantity: 1, price: 1.00 }];
    const itemsBase64 = encodeItems(items);

    // Build hash string in ABA’s required order
    const hashString =
      reqTime +
      MERCHANT_ID +
      tranId +
      amount.toFixed(2) +
      itemsBase64 +
      'Test' +
      'User' +
      'test@example.com' +
      '012345678' +
      'purchase' +
      'abapay_khqr' +
      '' + // callback_url
      '' + // return_deeplink
      'USD' +
      '' + // custom_fields
      '' + // return_params
      '' + // payout
      '6' + // lifetime
      'template3_color'; // qr_image_template

    const hash = generateHash(hashString);

    console.log('Raw hash string:', JSON.stringify(hashString));
    console.log('Generated hash:', hash);

    const payload = {
      req_time: reqTime,
      merchant_id: MERCHANT_ID,
      tran_id: tranId,
      amount: amount.toFixed(2),
      items: itemsBase64,
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone: '012345678',
      purchase_type: 'purchase',
      payment_option: 'abapay_khqr',
      callback_url: null,
      return_deeplink: null,
      currency: 'USD',
      custom_fields: null,
      return_params: null,
      payout: null,
      lifetime: 6,
      qr_image_template: 'template3_color',
      hash: hash,
    };

    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('🚀 Calling ABA Payway API...\n');

    const response = await axios.post(`${SANDBOX_URL}/payments/generate-qr`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('✅ SUCCESS! QR Code Generated\n');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('\n❌ ERROR: Failed to generate QR code\n');
    if (error.response) {
      console.error('API Error Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testQRGeneration();
