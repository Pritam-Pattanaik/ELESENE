const sequelize = require('../config/db');

const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const ProductVariant = require('./ProductVariant');
const ProductImage = require('./ProductImage');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Review = require('./Review');
const Coupon = require('./Coupon');
const Wishlist = require('./Wishlist');
const Address = require('./Address');
const Notification = require('./Notification');
const LoyaltyTransaction = require('./LoyaltyTransaction');
const LoyaltyReturnStat = require('./LoyaltyReturnStat');
const { LoyaltyTier, LoyaltySettings } = require('./LoyaltyTier');
const InvestmentTransaction = require('./InvestmentTransaction');
const InvestmentTierHistory = require('./InvestmentTierHistory');
const RewardRedemption = require('./RewardRedemption');
const EngagementActivity = require('./EngagementActivity');

// User Relationships
User.hasMany(Address, { foreignKey: 'user_id' });
Address.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(Cart, { foreignKey: 'user_id' });
Cart.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Wishlist, { foreignKey: 'user_id' });
Wishlist.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(User, { as: 'ReferredUsers', foreignKey: 'referred_by' });

// Category Relationships
Category.hasMany(Category, { as: 'SubCategories', foreignKey: 'parent_id' });
Category.belongsTo(Category, { as: 'Parent', foreignKey: 'parent_id' });

Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

// Product Relationships
Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(Review, { foreignKey: 'product_id' });
Review.belongsTo(Product, { foreignKey: 'product_id' });

// Order Relationships
Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Order.belongsTo(Coupon, { foreignKey: 'coupon_id' });
Coupon.hasMany(Order, { foreignKey: 'coupon_id' });

Order.belongsTo(Address, { foreignKey: 'shipping_address_id', as: 'shippingAddress' });

// OrderItem Relationships
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'variant_id' });

// Cart Relationships
Cart.hasMany(CartItem, { foreignKey: 'cart_id' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });

CartItem.belongsTo(Product, { foreignKey: 'product_id' });
CartItem.belongsTo(ProductVariant, { foreignKey: 'variant_id' });

// Review Relationships
Review.belongsTo(Order, { foreignKey: 'order_id' });

// Wishlist Relationships
Wishlist.belongsTo(Product, { foreignKey: 'product_id' });
Wishlist.belongsTo(ProductVariant, { foreignKey: 'variant_id' });

// Notification Relationships
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// Loyalty & Investment Relationships
User.hasMany(LoyaltyTransaction, { foreignKey: 'user_id', as: 'loyaltyTransactions' });
LoyaltyTransaction.belongsTo(User, { foreignKey: 'user_id' });

Order.hasMany(LoyaltyTransaction, { foreignKey: 'order_id', as: 'loyaltyTransactions' });
LoyaltyTransaction.belongsTo(Order, { foreignKey: 'order_id' });

User.hasOne(LoyaltyReturnStat, { foreignKey: 'user_id', as: 'returnStat' });
LoyaltyReturnStat.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(InvestmentTransaction, { foreignKey: 'user_id', as: 'investmentTransactions' });
InvestmentTransaction.belongsTo(User, { foreignKey: 'user_id' });

Order.hasMany(InvestmentTransaction, { foreignKey: 'order_id', as: 'investmentTransactions' });
InvestmentTransaction.belongsTo(Order, { foreignKey: 'order_id' });

User.hasMany(InvestmentTierHistory, { foreignKey: 'user_id', as: 'tierHistory' });
InvestmentTierHistory.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(RewardRedemption, { foreignKey: 'user_id', as: 'rewardRedemptions' });
RewardRedemption.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(EngagementActivity, { foreignKey: 'user_id', as: 'engagementActivities' });
EngagementActivity.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  ProductVariant,
  ProductImage,
  Order,
  OrderItem,
  Cart,
  CartItem,
  Review,
  Coupon,
  Wishlist,
  Address,
  Notification,
  LoyaltyTransaction,
  LoyaltyReturnStat,
  LoyaltyTier,
  LoyaltySettings,
  InvestmentTransaction,
  InvestmentTierHistory,
  RewardRedemption,
  EngagementActivity,
};
