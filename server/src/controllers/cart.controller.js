const { Cart, CartItem, Product, ProductVariant, ProductImage } = require('../models');

// Helper to get or create a cart
const getOrCreateCart = async (userId, sessionId) => {
  let cart;
  if (userId) {
    cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) cart = await Cart.create({ user_id: userId });
  } else if (sessionId) {
    cart = await Cart.findOne({ where: { session_id: sessionId } });
    if (!cart) cart = await Cart.create({ session_id: sessionId });
  }
  return cart;
};

// @desc    Get cart
// @route   GET /api/cart
const getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id']; // For guest carts

    if (!userId && !sessionId) {
      return res.status(400).json({ success: false, message: 'No user or session provided' });
    }

    const cart = await Cart.findOne({
      where: userId ? { user_id: userId } : { session_id: sessionId },
      include: [
        {
          model: CartItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'slug', 'base_price', 'sale_price'],
              include: [{ model: ProductImage, as: 'images', attributes: ['image_url'] }]
            },
            { model: ProductVariant, attributes: ['id', 'size', 'color', 'stock_quantity', 'additional_price'] }
          ]
        }
      ]
    });

    res.json({ success: true, cart: cart || { CartItems: [] } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
const addToCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];
    const { product_id, variant_id, quantity = 1 } = req.body;

    if (!userId && !sessionId) return res.status(400).json({ success: false, message: 'No user or session' });

    const cart = await getOrCreateCart(userId, sessionId);

    // Check if item already in cart
    let cartItem = await CartItem.findOne({
      where: { cart_id: cart.id, product_id, variant_id }
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cart_id: cart.id,
        product_id,
        variant_id,
        quantity
      });
    }

    res.json({ success: true, message: 'Item added to cart', cartItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:id
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItem = await CartItem.findByPk(req.params.id, {
      include: [{ model: Cart }]
    });

    if (!cartItem) return res.status(404).json({ success: false, message: 'Item not found' });

    // Assert ownership
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];
    const isUserOwner = userId && cartItem.Cart && cartItem.Cart.user_id === userId;
    const isSessionOwner = sessionId && cartItem.Cart && cartItem.Cart.session_id === sessionId;

    if (!isUserOwner && !isSessionOwner) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this cart item' });
    }

    if (quantity <= 0) {
      await cartItem.destroy();
      return res.json({ success: true, message: 'Item removed from cart' });
    }

    cartItem.quantity = Math.max(1, parseInt(quantity, 10) || 1);
    await cartItem.save();

    res.json({ success: true, cartItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:id
const removeFromCart = async (req, res) => {
  try {
    const cartItem = await CartItem.findByPk(req.params.id, {
      include: [{ model: Cart }]
    });

    if (!cartItem) return res.status(404).json({ success: false, message: 'Item not found' });

    // Assert ownership
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];
    const isUserOwner = userId && cartItem.Cart && cartItem.Cart.user_id === userId;
    const isSessionOwner = sessionId && cartItem.Cart && cartItem.Cart.session_id === sessionId;

    if (!isUserOwner && !isSessionOwner) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this cart item' });
    }

    await cartItem.destroy();
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
};
