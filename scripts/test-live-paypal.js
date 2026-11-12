import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { getPayPalAccessToken, createPayPalOrder, getPayPalOrderDetails, isPayPalConfigured } from '../src/lib/paypal.js';

async function testLivePayPal() {
  console.log('==================================================');
  console.log('💳 [SayPay] Testing Live PayPal Sandbox Connectivity');
  console.log('==================================================\n');

  console.log('1️⃣ Checking Configuration...');
  console.log('   Base URL:', process.env.PAYPAL_BASE_URL);
  console.log('   Client ID configured:', !!process.env.PAYPAL_CLIENT_ID);
  console.log('   Client Secret configured:', !!process.env.PAYPAL_CLIENT_SECRET);
  console.log('   isPayPalConfigured():', isPayPalConfigured());

  if (!isPayPalConfigured()) {
    console.error('❌ PayPal is not configured properly in .env.local');
    process.exit(1);
  }

  console.log('\n2️⃣ Testing OAuth 2.0 Access Token Acquisition (TN-49, TN-50)...');
  try {
    const token = await getPayPalAccessToken();
    console.log('   ✅ Successfully acquired PayPal OAuth 2.0 access token!');
    console.log('   Token prefix:', token.slice(0, 15) + '...');
  } catch (err) {
    console.error('   ❌ OAuth token acquisition failed:', err.message);
    if (err.data) console.error('   Error data:', err.data);
    process.exit(1);
  }

  console.log('\n3️⃣ Testing Orders v2 Order Creation (TN-51)...');
  let orderId = null;
  try {
    const order = await createPayPalOrder({
      checkId: 'test-check-' + Date.now(),
      amount: '12.50',
      currency: 'USD',
      reference: 'INV-TEST-001'
    });
    orderId = order.orderId;
    console.log('   ✅ Successfully created PayPal Orders v2 Order!');
    console.log('   Order ID:', order.orderId);
    console.log('   Status:', order.status);
    console.log('   Links:');
    order.raw?.links?.forEach(l => console.log(`     - ${l.rel}: ${l.href}`));
  } catch (err) {
    console.error('   ❌ Create order failed:', err.message);
    if (err.data) console.error('   Error details:', JSON.stringify(err.data, null, 2));
    process.exit(1);
  }

  console.log('\n4️⃣ Testing Get Order Details Reconciliation (TN-58)...');
  try {
    const details = await getPayPalOrderDetails(orderId);
    console.log('   ✅ Successfully retrieved order details!');
    console.log('   Order ID:', details.id);
    console.log('   Status:', details.status);
    console.log('   Intent:', details.intent);
    console.log('   Purchase units:', details.purchase_units?.[0]?.amount);
  } catch (err) {
    console.error('   ❌ Get order details failed:', err.message);
    process.exit(1);
  }

  console.log('\n==================================================');
  console.log('🎉 ALL PAYPAL SANDBOX CONNECTIVITY TESTS PASSED (100%)');
  console.log('==================================================');
}

testLivePayPal();
