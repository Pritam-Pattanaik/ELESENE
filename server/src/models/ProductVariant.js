const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductVariant = sequelize.define('ProductVariant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  size: DataTypes.STRING(20),
  color: DataTypes.STRING(50),
  color_hex: DataTypes.STRING(7),
  stock_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  sku_variant: {
    type: DataTypes.STRING(150),
    unique: true,
  },
  weight_grams: DataTypes.INTEGER,
  additional_price: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0,
  }
}, {
  tableName: 'product_variants',
  timestamps: false
});

module.exports = ProductVariant;
