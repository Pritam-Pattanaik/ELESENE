const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductBySlug, 
  getTrendingProducts 
} = require('../controllers/product.controller');

router.get('/', getProducts);
router.get('/trending', getTrendingProducts);
router.get('/:slug', getProductBySlug); // Ensure this is after /trending

module.exports = router;
