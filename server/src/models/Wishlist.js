const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Wishlist = sequelize.define('Wishlist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  }
}, {
  tableName: 'wishlists',
  timestamps: true,
  createdAt: 'added_at',
  updatedAt: false
});

module.exports = Wishlist;
