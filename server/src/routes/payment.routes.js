const express = require('express');
const router = express.Router();
const { handlePaymentWebhook } = require('../controllers/payment.controller');
const { webhookLimiter } = require('../middleware/rateLimit.middleware');

router.post('/webhook', webhookLimiter, handlePaymentWebhook);

module.exports = router;
