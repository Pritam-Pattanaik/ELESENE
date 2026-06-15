const { Order, OrderItem, Cart, CartItem, Product, ProductVariant } = require('../models');
const { createRazorpayOrder, verifyPaymentSignature } = require('../services/payment.service');
const { v4: uuidv4 } = require('uuid');

// @desc    Initiate checkout & create Razorpay order
// @route   POST /api/orders/initiate
const initiateOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address_id, notes } = req.body;

    // Get Cart
    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [
        {
          model: CartItem,
          include: [{ model: Product }, { model: ProductVariant }]
        }
      ]
    });

    if (!cart || cart.CartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Calculate Totals
    let subtotal = 0;
    cart.CartItems.forEach(item => {
      const price = item.ProductVariant?.additional_price 
        ? Number(item.Product.base_price) + Number(item.ProductVariant.additional_price)
        : Number(item.Product.base_price);
      subtotal += price * item.quantity;
    });

    // Mock shipping and tax for now
    const shipping_amount = subtotal > 999 ? 0 : 99;
    const tax_amount = subtotal * 0.18; // 18% GST mock
    const total_amount = subtotal + shipping_amount + tax_amount;

    // Create Order in DB
    const orderNumber = `LF-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    const newOrder = await Order.create({
      order_number: orderNumber,
      user_id: userId,
      subtotal,
      shipping_amount,
      tax_amount,
      total_amount,
      shipping_address_id: address_id,
      notes
    });

    // Create Order Items
    const orderItems = cart.CartItems.map(item => {
      const price = item.ProductVariant?.additional_price 
        ? Number(item.Product.base_price) + Number(item.ProductVariant.additional_price)
        : Number(item.Product.base_price);
        
      return {
        order_id: newOrder.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: price,
        total_price: price * item.quantity,
        product_snapshot: { name: item.Product.name, sku: item.Product.sku }
      };
    });

    await OrderItem.bulkCreate(orderItems);

    // Initiate Razorpay
    const rzpOrder = await createRazorpayOrder(total_amount, newOrder.id);
    
    newOrder.razorpay_order_id = rzpOrder.id;
    await newOrder.save();

    res.status(201).json({
      success: true,
      order: newOrder,
      razorpayOrder: rzpOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify payment
// @route   POST /api/orders/verify-payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const order = await Order.findOne({ where: { razorpay_order_id } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.payment_status = 'paid';
    order.status = 'confirmed';
    order.razorpay_payment_id = razorpay_payment_id;
    await order.save();

    // Clear user cart
    const cart = await Cart.findOne({ where: { user_id: order.user_id } });
    if (cart) {
      await CartItem.destroy({ where: { cart_id: cart.id } });
    }

    res.json({ success: true, message: 'Payment verified successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [{ model: OrderItem, include: [{ model: Product }] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  initiateOrder,
  verifyPayment,
  getUserOrders
};
