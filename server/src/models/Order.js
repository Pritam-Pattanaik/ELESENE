const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  order_number: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending',
  },
  subtotal: DataTypes.DECIMAL(10, 2),
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  shipping_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  tax_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total_amount: DataTypes.DECIMAL(10, 2),
  payment_status: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending',
  },
  payment_method: DataTypes.STRING(50),
  razorpay_order_id: DataTypes.STRING(100),
  razorpay_payment_id: DataTypes.STRING(100),
  tracking_number: DataTypes.STRING(100),
  shipped_at: DataTypes.DATE,
  delivered_at: DataTypes.DATE,
  notes: DataTypes.TEXT,
  return_reason_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'size_fit | damaged_on_arrival | wrong_item_received | defective | changed_mind | found_cheaper | no_longer_needed | pattern_return',
  },
  points_awarded: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Points earned by this order — stored for exact reversal on return',
  },
  investmentPointsEarned: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'investment_points_earned',
  },
  loyaltyPointsEarned: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'loyalty_points_earned',
  },
  rewardMultiplier: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 1.00,
    field: 'reward_multiplier',
  },
  campaignId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'campaign_id',
  },
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Order;
