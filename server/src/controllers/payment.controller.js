const { Order, OrderItem, Cart, CartItem, ProductVariant, Coupon } = require('../models');
const { verifyWebhookSignature } = require('../services/payment.service');
const investmentService = require('../services/investment.service');

const handlePaymentFailure = async (order, reason = 'Payment failed') => {
  if (order.payment_status === 'paid' || order.payment_status === 'failed') return;

  order.payment_status = 'failed';
  await order.save();

  // Restore variant stock reserved during initiateOrder
  const orderItems = await OrderItem.findAll({ where: { order_id: order.id } });
  for (const item of orderItems) {
    if (item.variant_id) {
      const variant = await ProductVariant.findByPk(item.variant_id);
      if (variant) {
        variant.stock_quantity = (variant.stock_quantity || 0) + item.quantity;
        await variant.save();
      }
    }
  }
};

// Helper to complete order payment, increment coupon usage, clear cart, award investment points
const completeOrderPayment = async (order, paymentId) => {
  if (order.payment_status === 'paid') return;

  // If order was previously marked failed, re-reserve stock for retried payment
  if (order.payment_status === 'failed') {
    const orderItems = await OrderItem.findAll({ where: { order_id: order.id } });
    for (const item of orderItems) {
      if (item.variant_id) {
        const variant = await ProductVariant.findByPk(item.variant_id);
        if (variant) {
          variant.stock_quantity = Math.max(0, variant.stock_quantity - item.quantity);
          await variant.save();
        }
      }
    }
  }

  // Ensure total_amount is non-null and valid before saving
  if (order.total_amount == null || isNaN(Number(order.total_amount))) {
    const orderItems = await OrderItem.findAll({ where: { order_id: order.id } });
    const itemsTotal = orderItems.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
    order.total_amount = itemsTotal > 0 ? itemsTotal : Number(order.subtotal || 0);
  }

  order.payment_status = 'paid';
  order.status = 'confirmed';
  if (paymentId) {
    order.razorpay_payment_id = paymentId;
  }
  await order.save();


  // Award Brand Investment Points & Loyalty Points
  if (order.user_id) {
    try {
      await investmentService.awardPurchaseInvestment(order.user_id, order.id, order.total_amount);
    } catch (err) {
      console.warn('Failed to award investment points for order:', err.message);
    }
  }

  // Increment coupon usage count if a coupon was used
  if (order.coupon_id) {
    const coupon = await Coupon.findByPk(order.coupon_id);
    if (coupon) {
      coupon.usage_count = (coupon.usage_count || 0) + 1;
      await coupon.save();
    }
  }

  // Clear user cart
  if (order.user_id) {
    const cart = await Cart.findOne({ where: { user_id: order.user_id } });
    if (cart) {
      await CartItem.destroy({ where: { cart_id: cart.id } });
    }
  }
};

const handlePaymentWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.warn('RAZORPAY_WEBHOOK_SECRET is not configured.');
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
          console.log(`Order ${order.order_number} successfully fulfilled via Payment Webhook.`);
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
    console.error('Payment webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  handlePaymentWebhook,
  completeOrderPayment,
  handlePaymentFailure
};
