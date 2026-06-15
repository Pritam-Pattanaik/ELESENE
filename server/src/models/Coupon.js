const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
  },
  type: DataTypes.STRING(20),
  value: DataTypes.DECIMAL(8, 2),
  min_order_value: DataTypes.DECIMAL(8, 2),
  max_discount: DataTypes.DECIMAL(8, 2),
  usage_limit: DataTypes.INTEGER,
  usage_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  per_user_limit: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  valid_from: DataTypes.DATE,
  valid_until: DataTypes.DATE,
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  applicable_categories: DataTypes.ARRAY(DataTypes.UUID),
  applicable_products: DataTypes.ARRAY(DataTypes.UUID)
}, {
  tableName: 'coupons',
  timestamps: false
});

module.exports = Coupon;
