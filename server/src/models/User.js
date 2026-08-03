const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firebase_uid: {
    type: DataTypes.STRING(128),
    unique: true,
  },
  email: {
    type: DataTypes.STRING(255),
    unique: true,
  },
  phone: {
    type: DataTypes.STRING(15),
    unique: true,
  },
  full_name: DataTypes.STRING(100),
  profile_picture: DataTypes.TEXT,
  gender: DataTypes.STRING(20),
  date_of_birth: DataTypes.DATEONLY,
  persona: DataTypes.STRING(50),
  referral_code: {
    type: DataTypes.STRING(20),
    unique: true,
  },
  loyalty_points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  role: {
    type: DataTypes.ENUM('customer', 'admin', 'superadmin'),
    defaultValue: 'customer',
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true, // only required for admin/superadmin
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  reset_password_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  reset_password_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  verification_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  verification_token_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  tokenVersion: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    field: 'token_version',
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;
