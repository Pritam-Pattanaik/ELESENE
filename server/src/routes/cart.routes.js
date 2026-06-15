const express = require('express');
const router = express.Router();
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart 
} = require('../controllers/cart.controller');

// Optional auth middleware (doesn't block if no token, just sets req.user if valid)
const jwt = require('jsonwebtoken');
const optionalAuth = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET || 'elesene_super_secret_key');
    } catch (error) {
      // ignore invalid token for optional auth
    }
  }
  next();
};

router.use(optionalAuth);

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:id', updateCartItem);
router.delete('/items/:id', removeFromCart);

module.exports = router;
