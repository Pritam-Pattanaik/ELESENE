const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LoyaltyTier = sequelize.define('LoyaltyTier', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  min_points: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  max_points: {
    type: DataTypes.INTEGER,
    allowNull: true, // null = top tier, no ceiling
  },
  sort_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  perks: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    comment: '{ early_access_hours, birthday_discount_pct, free_shipping, invite_events, priority_support }',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'loyalty_tiers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

const LoyaltySettings = sequelize.define('LoyaltySettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    defaultValue: 1,
  },
  points_per_100_inr: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  return_flag_threshold_pct: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 40.0,
  },
  return_flag_min_orders: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'loyalty_settings',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
});

module.exports = { LoyaltyTier, LoyaltySettings };
