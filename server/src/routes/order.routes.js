const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { 
  initiateOrder, 
  verifyPayment, 
  getUserOrders,
  handleRazorpayWebhook,
  applyCoupon,
  cancelOrder
} = require('../controllers/order.controller');

// Razorpay Webhook (must not be authenticated)
router.post('/webhook', handleRazorpayWebhook);

// All other order routes require authentication
router.use(protect);

router.post('/initiate', initiateOrder);
router.post('/', initiateOrder);
router.post('/verify-payment', verifyPayment);
router.post('/apply-coupon', applyCoupon);
router.get('/', getUserOrders);
router.post('/:id/cancel', cancelOrder);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
