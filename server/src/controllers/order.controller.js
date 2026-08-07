const { Order, OrderItem, Cart, CartItem, Product, ProductVariant, ProductImage, Coupon } = require('../models');
const sequelize = require('../config/db');
const { createRazorpayOrder, verifyPaymentSignature, verifyWebhookSignature } = require('../services/payment.service');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const { completeOrderPayment, handlePaymentFailure } = require('./payment.controller');


// @desc    Initiate checkout & create Razorpay order inside DB transaction with pessimistic stock locking
// @route   POST /api/orders/initiate
const initiateOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { address_id, notes, coupon_code } = req.body;

    // Get Cart inside transaction
    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [
        {
          model: CartItem,
          include: [{ model: Product }, { model: ProductVariant }]
        }
      ],
      transaction: t
    });

    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // 1. Stock Validation & Reservation inside Transaction (Pessimistic Lock)
    let subtotal = 0;
    for (const item of cart.CartItems) {
      const price = item.ProductVariant?.additional_price 
        ? Number(item.Product.base_price) + Number(item.ProductVariant.additional_price)
        : Number(item.Product.base_price);
      subtotal += price * item.quantity;

      if (item.variant_id) {
        const variant = await ProductVariant.findByPk(item.variant_id, { 
          transaction: t, 
          lock: t.LOCK.UPDATE 
        });

        if (!variant || variant.stock_quantity < item.quantity) {
          await t.rollback();
          return res.status(409).json({ 
            success: false, 
            message: `Insufficient stock for variant ${item.variant_id} (${item.Product?.name || 'item'}${variant ? `, ${variant.size}/${variant.color}` : ''}). Available: ${variant ? variant.stock_quantity : 0}` 
          });
        }

        // Decrement stock immediately at order creation
        variant.stock_quantity -= item.quantity;
        await variant.save({ transaction: t });
      }
    }

    // 2. Apply Coupon if provided
    let discount_amount = 0;
    let coupon_id = null;

    if (coupon_code) {
      const coupon = await Coupon.findOne({ 
        where: { code: coupon_code.trim().toUpperCase(), is_active: true },
        transaction: t
      });

      if (!coupon) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Invalid or inactive coupon code' });
      }

      const now = new Date();
      if (coupon.valid_from && now < new Date(coupon.valid_from)) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Coupon not yet active' });
      }
      if (coupon.valid_until && now > new Date(coupon.valid_until)) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Coupon expired' });
      }

      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
      }

      if (coupon.per_user_limit) {
        const userUsageCount = await Order.count({
          where: { user_id: userId, coupon_id: coupon.id, payment_status: 'paid' },
          transaction: t
        });
        if (userUsageCount >= coupon.per_user_limit) {
          await t.rollback();
          return res.status(400).json({ success: false, message: 'You have reached the maximum usage limit for this coupon' });
        }
      }

      if (coupon.min_order_value && subtotal < Number(coupon.min_order_value)) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Minimum purchase of ₹${Number(coupon.min_order_value).toLocaleString()} required for this coupon` });
      }

      let eligibleSubtotal = subtotal;
      const hasCategoryFilter = Array.isArray(coupon.applicable_categories) && coupon.applicable_categories.length > 0;
      const hasProductFilter = Array.isArray(coupon.applicable_products) && coupon.applicable_products.length > 0;

      if (hasCategoryFilter || hasProductFilter) {
        eligibleSubtotal = cart.CartItems.reduce((acc, item) => {
          const prod = item.Product;
          const price = item.ProductVariant?.additional_price
            ? Number(prod.base_price) + Number(item.ProductVariant.additional_price)
            : Number(prod.base_price);
          
          let isCategoryMatch = !hasCategoryFilter || coupon.applicable_categories.includes(prod.category_id);
          let isProductMatch = !hasProductFilter || coupon.applicable_products.includes(prod.id);

          if (isCategoryMatch && isProductMatch) {
            return acc + (price * item.quantity);
          }
          return acc;
        }, 0);

        if (eligibleSubtotal === 0) {
          await t.rollback();
          return res.status(400).json({ success: false, message: 'This coupon is not applicable to any items in your bag' });
        }
      }

      if (coupon.type === 'percentage') {
        const discValue = (eligibleSubtotal * Number(coupon.value)) / 100;
        discount_amount = coupon.max_discount ? Math.min(discValue, Number(coupon.max_discount)) : discValue;
      } else if (coupon.type === 'fixed') {
        discount_amount = Math.min(Number(coupon.value), eligibleSubtotal);
      }

      coupon_id = coupon.id;
    }

    const discountedSubtotal = subtotal - discount_amount;
    const shipping_amount = discountedSubtotal > 999 ? 0 : 99;
    const tax_amount = Math.round(discountedSubtotal * 0.18);
    const total_amount = discountedSubtotal + shipping_amount + tax_amount;

    // 3. Create Order & Order Items in DB inside Transaction
    const orderNumber = `LF-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    const newOrder = await Order.create({
      order_number: orderNumber,
      user_id: userId,
      subtotal,
      discount_amount,
      shipping_amount,
      tax_amount,
      total_amount,
      shipping_address_id: address_id,
      notes,
      coupon_id
    }, { transaction: t });

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

    await OrderItem.bulkCreate(orderItems, { transaction: t });

    // 4. Initiate Razorpay
    const rzpOrder = await createRazorpayOrder(total_amount, newOrder.id);
    
    newOrder.razorpay_order_id = rzpOrder.id;
    await newOrder.save({ transaction: t });

    await t.commit();

    res.status(201).json({
      success: true,
      order: newOrder,
      razorpayOrder: rzpOrder,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TMQq9wmG77ZzLQ'
    });
  } catch (error) {
    await t.rollback();
    console.error('Error initiating order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order & restore variant stock inside DB transaction
// @route   POST /api/orders/:id/cancel, PUT /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    const order = await Order.findByPk(orderId, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check ownership unless admin/superadmin
    if (order.user_id !== userId && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      await t.rollback();
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (order.status === 'cancelled') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Order is already cancelled' });
    }

    // Restore variant stock
    const orderItems = await OrderItem.findAll({ where: { order_id: order.id }, transaction: t });
    for (const item of orderItems) {
      if (item.variant_id) {
        const variant = await ProductVariant.findByPk(item.variant_id, { 
          transaction: t, 
          lock: t.LOCK.UPDATE 
        });
        if (variant) {
          variant.stock_quantity += item.quantity;
          await variant.save({ transaction: t });
        }
      }
    }

    order.status = 'cancelled';
    await order.save({ transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: 'Order cancelled successfully and stock restored',
      order
    });
  } catch (error) {
    await t.rollback();
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

    await completeOrderPayment(order, razorpay_payment_id);

    res.json({ success: true, message: 'Payment verified successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Handle Razorpay Webhook
// @route   POST /api/orders/webhook
const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.warn('RAZORPAY_WEBHOOK_SECRET is not configured. Webhook bypassed.');
      return res.status(400).json({ success: false, message: 'Webhook secret is not configured' });
    }

    const payloadBuffer = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    const isValid = verifyWebhookSignature(payloadBuffer, signature, secret);

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const eventData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const event = eventData?.event;

    if (event === 'order.paid' || event === 'payment.captured') {
      const paymentEntity = eventData.payload?.payment?.entity;
      const razorpay_order_id = paymentEntity?.order_id || eventData.payload?.order?.entity?.id;
      const razorpay_payment_id = paymentEntity?.id;

      if (razorpay_order_id) {
        const order = await Order.findOne({ where: { razorpay_order_id } });
        if (order) {
          await completeOrderPayment(order, razorpay_payment_id);
          console.log(`Order ${order.order_number} successfully fulfilled via Webhook.`);
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = eventData.payload?.payment?.entity;
      const razorpay_order_id = paymentEntity?.order_id;
      if (razorpay_order_id) {
        const order = await Order.findOne({ where: { razorpay_order_id } });
        if (order) {
          await handlePaymentFailure(order, paymentEntity?.error_description || 'Payment failed');
          console.log(`Order ${order.order_number} marked failed via Webhook.`);
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
const getUserOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              include: [{ model: ProductImage, as: 'images', attributes: ['image_url', 'is_primary', 'alt_text'] }],
            },
            { model: ProductVariant, attributes: ['size', 'color'] },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });
    res.json({
      success: true,
      orders,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate and apply coupon
// @route   POST /api/orders/apply-coupon
const applyCoupon = async (req, res) => {
  try {
    const userId = req.user.id;
    const { coupon_code, cart_items, subtotal: inputSubtotal } = req.body;

    if (!coupon_code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({
      where: { code: coupon_code.trim().toUpperCase(), is_active: true }
    });

    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive coupon code' });
    }

    // 1. Check valid dates
    const now = new Date();
    if (coupon.valid_from && now < new Date(coupon.valid_from)) {
      return res.status(400).json({ success: false, message: 'Coupon is not active yet' });
    }
    if (coupon.valid_until && now > new Date(coupon.valid_until)) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    // 2. Check global usage limit
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    // 3. Check per-user limit
    if (coupon.per_user_limit) {
      const userUsageCount = await Order.count({
        where: {
          user_id: userId,
          coupon_id: coupon.id,
          payment_status: 'paid'
        }
      });
      if (userUsageCount >= coupon.per_user_limit) {
        return res.status(400).json({ success: false, message: 'You have reached the maximum usage limit for this coupon' });
      }
    }

    // Determine subtotal & items
    let cartSubtotal = Number(inputSubtotal) || 0;
    let itemsToEvaluate = cart_items || [];

    if (itemsToEvaluate.length === 0 || !cartSubtotal) {
      const cart = await Cart.findOne({
        where: { user_id: userId },
        include: [{
          model: CartItem,
          include: [{ model: Product }, { model: ProductVariant }]
        }]
      });

      if (cart && cart.CartItems) {
        itemsToEvaluate = cart.CartItems;
        cartSubtotal = cart.CartItems.reduce((acc, item) => {
          const price = item.ProductVariant?.additional_price
            ? Number(item.Product.base_price) + Number(item.ProductVariant.additional_price)
            : Number(item.Product.base_price);
          return acc + price * item.quantity;
        }, 0);
      }
    }

    // 4. Check minimum order value
    if (coupon.min_order_value && cartSubtotal < Number(coupon.min_order_value)) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of ₹${Number(coupon.min_order_value).toLocaleString()} required for this coupon`
      });
    }

    // 5. Category & Product Scope check
    let eligibleSubtotal = cartSubtotal;
    const hasCategoryFilter = Array.isArray(coupon.applicable_categories) && coupon.applicable_categories.length > 0;
    const hasProductFilter = Array.isArray(coupon.applicable_products) && coupon.applicable_products.length > 0;

    if (hasCategoryFilter || hasProductFilter) {
      eligibleSubtotal = itemsToEvaluate.reduce((acc, item) => {
        const prod = item.Product || item.product;
        const price = item.ProductVariant?.additional_price
          ? Number(prod.base_price) + Number(item.ProductVariant.additional_price)
          : Number(prod?.base_price || item.price || 0);
        const qty = item.quantity || 1;

        let isCategoryMatch = !hasCategoryFilter || (prod && coupon.applicable_categories.includes(prod.category_id));
        let isProductMatch = !hasProductFilter || (prod && coupon.applicable_products.includes(prod.id));

        if (isCategoryMatch && isProductMatch) {
          return acc + (price * qty);
        }
        return acc;
      }, 0);

      if (eligibleSubtotal === 0) {
        return res.status(400).json({
          success: false,
          message: 'This coupon is not applicable to any items in your bag'
        });
      }
    }

    // 6. Calculate discount amount
    let discount_amount = 0;
    if (coupon.type === 'percentage') {
      const discValue = (eligibleSubtotal * Number(coupon.value)) / 100;
      discount_amount = coupon.max_discount ? Math.min(discValue, Number(coupon.max_discount)) : discValue;
    } else if (coupon.type === 'fixed') {
      discount_amount = Math.min(Number(coupon.value), eligibleSubtotal);
    }

    res.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
        max_discount: coupon.max_discount ? Number(coupon.max_discount) : null
      },
      discount_amount,
      message: `Coupon '${coupon.code}' applied successfully!`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  initiateOrder,
  verifyPayment,
  handleRazorpayWebhook,
  getUserOrders,
  applyCoupon,
  cancelOrder
};
