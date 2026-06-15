const express = require('express');
const router = express.Router();
const { protect, admin, superAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const {
  // Dashboard
  getDashboard,
  // Products
  createProduct,
  getAdminProducts,
  getAdminProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  createVariant,
  updateVariant,
  deleteVariant,
  // Categories
  createCategory,
  getAdminCategories,
  updateCategory,
  deleteCategory,
  // Orders
  getAdminOrders,
  getAdminOrder,
  updateOrderStatus,
  updateOrderTracking,
  // Users
  getAdminUsers,
  getAdminUser,
  updateUserRole,
  // Coupons
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  // Reviews
  getAdminReviews,
  updateReview,
  deleteReview,
} = require('../controllers/admin.controller');

// All admin routes are protected
router.use(protect, admin);

// Dashboard
router.get('/dashboard', getDashboard);

// Products
router.get('/products', getAdminProducts);
router.post('/products', createProduct);
router.get('/products/:id', getAdminProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/products/:id/images', upload.array('images', 5), uploadProductImages);
router.delete('/products/:id/images/:imageId', deleteProductImage);
router.post('/products/:id/variants', createVariant);
router.put('/products/:id/variants/:variantId', updateVariant);
router.delete('/products/:id/variants/:variantId', deleteVariant);

// Categories
router.get('/categories', getAdminCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Orders
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrder);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/tracking', updateOrderTracking);

// Users
router.get('/users', getAdminUsers);
router.get('/users/:id', getAdminUser);
router.put('/users/:id/role', protect, superAdmin, updateUserRole);

// Coupons
router.get('/coupons', getAdminCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Reviews
router.get('/reviews', getAdminReviews);
router.put('/reviews/:id', updateReview);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
