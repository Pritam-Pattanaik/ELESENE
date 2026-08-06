const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InvestmentTransaction = sequelize.define('InvestmentTransaction', {
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
  orderId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'order_id',
  },
  source: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'purchase | review | referral | profile_completion | social_share | admin_adjustment | campaign_bonus',
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  investmentPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'investment_points',
  },
  loyaltyPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'loyalty_points',
  },
  multiplier: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 1.00,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'created_by',
  },
}, {
  tableName: 'investment_transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = InvestmentTransaction;
