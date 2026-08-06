const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const EngagementActivity = sequelize.define('EngagementActivity', {
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
  activityType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'activity_type', // review | referral | profile_completion | social_share | birthday | festival
  },
  referenceId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'reference_id',
  },
  ipAwarded: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'ip_awarded',
  },
  lpAwarded: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'lp_awarded',
  },
}, {
  tableName: 'engagement_activities',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = EngagementActivity;
