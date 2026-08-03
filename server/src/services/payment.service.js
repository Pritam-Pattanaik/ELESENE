const Razorpay = require('razorpay');
const crypto = require('crypto');
require('../config/env')

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_dummy',
});

const createRazorpayOrder = async (amount, receipt) => {
  const options = {
    amount: Math.round(amount * 100), // amount in paise
    currency: 'INR',
    receipt: String(receipt),
    payment_capture: 1 // auto capture
  };

  try {
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    if (process.env.RAZORPAY_KEY_ID?.includes('00000000') || process.env.NODE_ENV !== 'production') {
      console.warn('[Razorpay] Using test/mock order fallback:', error.message);
      return {
        id: `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        entity: 'order',
        amount: options.amount,
        currency: 'INR',
        receipt: options.receipt,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000)
      };
    }
    throw new Error('Razorpay order creation failed: ' + (error.message || JSON.stringify(error)));
  }
};

const verifyPaymentSignature = (order_id, payment_id, signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_dummy';
  if (!signature) return false;
  const body = order_id + '|' + payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === signature;
};

const verifyWebhookSignature = (rawBody, signature, secret) => {
  if (!rawBody || !signature || !secret) return false;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature;
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature
};
