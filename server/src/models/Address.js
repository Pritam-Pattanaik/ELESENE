const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  label: DataTypes.STRING(50),
  full_name: DataTypes.STRING(100),
  phone: DataTypes.STRING(15),
  address_line1: DataTypes.TEXT,
  address_line2: DataTypes.TEXT,
  city: DataTypes.STRING(100),
  state: DataTypes.STRING(100),
  pincode: DataTypes.STRING(10),
  country: {
    type: DataTypes.STRING(50),
    defaultValue: 'UK',
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: 'addresses',
  timestamps: false
});

module.exports = Address;
