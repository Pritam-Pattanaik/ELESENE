const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 }
  },
  title: DataTypes.STRING(150),
  body: DataTypes.TEXT,
  images: DataTypes.ARRAY(DataTypes.TEXT),
  fit_feedback: DataTypes.STRING(50),
  is_verified_purchase: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  helpful_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Review;
