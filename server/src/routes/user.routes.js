const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getUserProfile,
  updateUserProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  removeFromWishlistByProduct,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
} = require('../controllers/user.controller');

// All routes require authentication
router.use(protect);

// Profile
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Addresses
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);

// Wishlist
router.get('/wishlist', getWishlist);
router.post('/wishlist', addToWishlist);
router.delete('/wishlist/product/:product_id', removeFromWishlistByProduct); // Must come BEFORE /:id
router.delete('/wishlist/:id', removeFromWishlist);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);
router.delete('/notifications/:id', deleteNotification);

module.exports = router;
