const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LoyaltyTransaction = sequelize.define('LoyaltyTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('earn', 'spend', 'reversal', 'adjustment'),
    allowNull: false,
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  balance_after: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'loyalty_transactions',
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = LoyaltyTransaction;
