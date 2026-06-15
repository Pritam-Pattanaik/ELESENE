const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder',
});

const createRazorpayOrder = async (amount, receipt) => {
  const options = {
    amount: Math.round(amount * 100), // amount in paise
    currency: 'INR',
    receipt,
    payment_capture: 1 // auto capture
  };

  try {
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    throw new Error('Razorpay order creation failed: ' + error.message);
  }
};

const verifyPaymentSignature = (order_id, payment_id, signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';
  const body = order_id + '|' + payment_id;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');
    
  return expectedSignature === signature;
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature
};
