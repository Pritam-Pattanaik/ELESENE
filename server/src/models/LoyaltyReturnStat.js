const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LoyaltyReturnStat = sequelize.define('LoyaltyReturnStat', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  total_orders: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  total_returns: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  weighted_returns: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    defaultValue: 0,
  },
  return_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
  },
  is_flagged: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  flag_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  flagged_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  restriction_level: {
    type: DataTypes.ENUM('none', 'soft', 'medium', 'hard'),
    allowNull: false,
    defaultValue: 'none',
  },
  restriction_note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  restriction_set_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  restriction_set_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'loyalty_return_stats',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
});

module.exports = LoyaltyReturnStat;
