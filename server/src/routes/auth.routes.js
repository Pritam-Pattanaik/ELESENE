const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  adminLogin, 
  getProfile,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  sendVerificationEmailHandler,
  verifyEmail
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimit.middleware');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/admin-login', authLimiter, adminLogin);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);
router.post('/change-password', protect, changePassword);
router.post('/logout', protect, logout);
router.post('/verify-email', verifyEmail);
router.post('/send-verification-email', protect, sendVerificationEmailHandler);
router.get('/profile', protect, getProfile);

module.exports = router;
