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
  // Supabase Storage object path (e.g. "<product-id>/1234567890.webp").
  // Populated only for images uploaded via the Supabase bucket.
  // NULL for legacy URL-pasted or local-disk images.
  storage_path: {
    type: DataTypes.TEXT,
    allowNull: true,
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
