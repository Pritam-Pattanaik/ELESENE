const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RewardRedemption = sequelize.define('RewardRedemption', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
  },
  rewardTitle: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'reward_title',
  },
  rewardType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'reward_type', // coupon | free_shipping | product | exclusive_access
  },
  loyaltyPointsSpent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'loyalty_points_spent',
  },
  couponCodeGenerated: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'coupon_code_generated',
  },
  status: {
    type: DataTypes.STRING(30),
    defaultValue: 'active', // active | used | expired
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at',
  },
}, {
  tableName: 'reward_redemptions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = RewardRedemption;
