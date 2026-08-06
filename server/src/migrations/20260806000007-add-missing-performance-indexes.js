'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Notifications table indexes
    await queryInterface.addIndex('notifications', ['user_id'], { name: 'idx_notifications_user_id' }).catch(() => {});
    await queryInterface.addIndex('notifications', ['user_id', 'is_read'], { name: 'idx_notifications_user_unread' }).catch(() => {});
    await queryInterface.addIndex('notifications', ['created_at'], { name: 'idx_notifications_created_at' }).catch(() => {});

    // 2. Investment transactions table indexes
    await queryInterface.addIndex('investment_transactions', ['user_id'], { name: 'idx_it_user_id' }).catch(() => {});
    await queryInterface.addIndex('investment_transactions', ['order_id'], { name: 'idx_it_order_id' }).catch(() => {});
    await queryInterface.addIndex('investment_transactions', ['created_at'], { name: 'idx_it_created_at' }).catch(() => {});

    // 3. Investment tier history table indexes
    await queryInterface.addIndex('investment_tier_history', ['user_id'], { name: 'idx_ith_user_id' }).catch(() => {});

    // 4. Reward redemptions table indexes
    await queryInterface.addIndex('reward_redemptions', ['user_id'], { name: 'idx_rr_user_id' }).catch(() => {});
    await queryInterface.addIndex('reward_redemptions', ['status'], { name: 'idx_rr_status' }).catch(() => {});

    // 5. Engagement activities table indexes
    await queryInterface.addIndex('engagement_activities', ['user_id'], { name: 'idx_ea_user_id' }).catch(() => {});
    await queryInterface.addIndex('engagement_activities', ['activity_type'], { name: 'idx_ea_activity_type' }).catch(() => {});

    // 6. Orders composite indexes
    await queryInterface.addIndex('orders', ['user_id', 'status'], { name: 'idx_orders_user_status' }).catch(() => {});
    await queryInterface.addIndex('orders', ['status', 'created_at'], { name: 'idx_orders_status_created' }).catch(() => {});

    // 7. Products composite indexes
    await queryInterface.addIndex('products', ['category_id', 'is_active'], { name: 'idx_products_cat_active' }).catch(() => {});
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('notifications', 'idx_notifications_user_id').catch(() => {});
    await queryInterface.removeIndex('notifications', 'idx_notifications_user_unread').catch(() => {});
    await queryInterface.removeIndex('notifications', 'idx_notifications_created_at').catch(() => {});
    await queryInterface.removeIndex('investment_transactions', 'idx_it_user_id').catch(() => {});
    await queryInterface.removeIndex('investment_transactions', 'idx_it_order_id').catch(() => {});
    await queryInterface.removeIndex('investment_transactions', 'idx_it_created_at').catch(() => {});
    await queryInterface.removeIndex('investment_tier_history', 'idx_ith_user_id').catch(() => {});
    await queryInterface.removeIndex('reward_redemptions', 'idx_rr_user_id').catch(() => {});
    await queryInterface.removeIndex('reward_redemptions', 'idx_rr_status').catch(() => {});
    await queryInterface.removeIndex('engagement_activities', 'idx_ea_user_id').catch(() => {});
    await queryInterface.removeIndex('engagement_activities', 'idx_ea_activity_type').catch(() => {});
    await queryInterface.removeIndex('orders', 'idx_orders_user_status').catch(() => {});
    await queryInterface.removeIndex('orders', 'idx_orders_status_created').catch(() => {});
    await queryInterface.removeIndex('products', 'idx_products_cat_active').catch(() => {});
  }
};
