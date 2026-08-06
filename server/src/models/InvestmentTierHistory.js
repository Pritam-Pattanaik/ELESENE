const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InvestmentTierHistory = sequelize.define('InvestmentTierHistory', {
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
  previousTier: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'previous_tier',
  },
  newTier: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'new_tier',
  },
  investmentPointsAtChange: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'investment_points_at_change',
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'investment_tier_history',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = InvestmentTierHistory;
