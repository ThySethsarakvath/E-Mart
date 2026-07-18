/**
 * ABA Payway Setup Verification Script
 *
 * Usage:
 * Run from Backend/order-worker with: npm run verify:payway
 */

const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

// Configuration
const MERCHANT_ID = process.env.PAYWAY_MERCHANT_ID;
const API_KEY = process.env.PAYWAY_API_KEY;
const PAYWAY_BASE_URL =
  process.env.PAYWAY_BASE_URL || process.env.PAYWAY_SANDBOX_URL;

if (!MERCHANT_ID || !API_KEY || !PAYWAY_BASE_URL) {
  throw new Error(
    'PAYWAY_MERCHANT_ID, PAYWAY_API_KEY, and PAYWAY_BASE_URL are required',
  );
}

console.log('🔍 ABA Payway Setup Verification\n');
console.log('Configuration:');
console.log('  Merchant ID: configured');
console.log('  API Key: configured');
console.log(`  Base URL: ${PAYWAY_BASE_URL}\n`);

// Generate HMAC-SHA512 hash
function generateHash(data) {
  const hmac = crypto.createHmac('sha512', API_KEY);
  hmac.update(data);
  return hmac.digest('base64');
}

function formatPayWayRequestTime(date = new Date()) {
  return date.toISOString().replace(/\D/g, '').slice(0, 14);
}

// Generate unique transaction ID (≤ 20 chars)
function generateTransactionId(requestTime) {
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return requestTime.slice(2) + random; // 16 chars
}

// Base64 encode items
function encodeItems(items) {
  return Buffer.from(JSON.stringify(items)).toString('base64');
}

async function testQRGeneration() {
  try {
    console.log('📝 Generating test QR code...\n');

    const reqTime = formatPayWayRequestTime();
    const tranId = generateTransactionId(reqTime);

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

    console.log('🚀 Calling ABA Payway API...\n');

    const response = await axios.post(`${PAYWAY_BASE_URL}/payments/generate-qr`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('✅ SUCCESS! QR Code Generated\n');
    console.log(
      'Result:',
      JSON.stringify(
        {
          status: response.data.status,
          amount: response.data.amount,
          currency: response.data.currency,
          qrStringGenerated: Boolean(response.data.qrString),
          qrImageGenerated: Boolean(response.data.qrImage),
          deeplinkGenerated: Boolean(response.data.abapay_deeplink),
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error('\n❌ ERROR: Failed to generate QR code\n');
    if (error.response) {
      console.error('API Error Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    process.exitCode = 1;
  }
}

testQRGeneration();
