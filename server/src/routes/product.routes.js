const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { 
  getProducts, 
  getProductBySlug, 
  getTrendingProducts,
  createProductReview
} = require('../controllers/product.controller');

router.get('/', getProducts);
router.get('/trending', getTrendingProducts);
router.get('/:slug', getProductBySlug); // Ensure this is after /trending
router.post('/:id/reviews', protect, createProductReview);

module.exports = router;
