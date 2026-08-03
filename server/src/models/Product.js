const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
  },
  description: DataTypes.TEXT,
  brand: {
    type: DataTypes.STRING(100),
    defaultValue: 'ELESENE',
  },
  base_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  sale_price: DataTypes.DECIMAL(10, 2),
  sku: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
  },
  material: DataTypes.TEXT,
  care_instructions: DataTypes.TEXT,
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_trending: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  tags: DataTypes.ARRAY(DataTypes.STRING),
  meta_title: DataTypes.STRING(255),
  meta_description: DataTypes.TEXT,
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Product;
