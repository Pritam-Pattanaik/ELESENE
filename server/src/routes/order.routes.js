const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { 
  initiateOrder, 
  verifyPayment, 
  getUserOrders 
} = require('../controllers/order.controller');

// All order routes require authentication
router.use(protect);

router.post('/initiate', initiateOrder);
router.post('/verify-payment', verifyPayment);
router.get('/', getUserOrders);

module.exports = router;
