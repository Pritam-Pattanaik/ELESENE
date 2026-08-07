const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  product_snapshot: {
    type: DataTypes.JSONB,
  }
}, {
  tableName: 'order_items',
  timestamps: false
});

OrderItem.prototype.toJSON = function () {
  const values = { ...this.get() };
  const unitPrice = values.unit_price != null ? Number(values.unit_price) : 0;
  const totalPrice = values.total_price != null ? Number(values.total_price) : 0;
  values.unit_price = unitPrice;
  values.price = unitPrice;
  values.total_price = totalPrice;
  values.totalPrice = totalPrice;
  values.quantity = values.quantity != null ? Number(values.quantity) : 1;
  return values;
};

module.exports = OrderItem;

