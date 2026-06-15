const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductImage = sequelize.define('ProductImage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  alt_text: DataTypes.STRING(255),
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  color_tag: DataTypes.STRING(50),
}, {
  tableName: 'product_images',
  timestamps: false
});

module.exports = ProductImage;
