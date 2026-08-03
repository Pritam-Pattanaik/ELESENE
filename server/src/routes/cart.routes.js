const express = require('express');
const router = express.Router();
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart 
} = require('../controllers/cart.controller');

const { optionalProtect } = require('../middleware/auth.middleware');

router.use(optionalProtect);

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:id', updateCartItem);
router.delete('/items/:id', removeFromCart);

module.exports = router;
