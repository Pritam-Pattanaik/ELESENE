'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add fields to users table
    const userColumns = [
      { name: 'lifetime_investment_amount', type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      { name: 'investment_points', type: Sequelize.INTEGER, defaultValue: 0 },
      { name: 'investment_tier', type: Sequelize.STRING(50), defaultValue: 'Seed' },
      { name: 'tier_achieved_at', type: Sequelize.DATE, allowNull: true },
      { name: 'next_tier_progress', type: Sequelize.INTEGER, defaultValue: 0 },
      { name: 'total_referrals', type: Sequelize.INTEGER, defaultValue: 0 },
      { name: 'engagement_score', type: Sequelize.INTEGER, defaultValue: 0 },
      { name: 'investment_level', type: Sequelize.INTEGER, defaultValue: 1 },
      { name: 'total_orders', type: Sequelize.INTEGER, defaultValue: 0 },
      { name: 'total_spent', type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
    ];

    for (const col of userColumns) {
      await queryInterface.addColumn('users', col.name, {
        type: col.type,
        defaultValue: col.defaultValue,
        allowNull: col.allowNull !== undefined ? col.allowNull : false,
      }).catch(err => console.log(`Column ${col.name} already exists on users or skipped:`, err.message));
    }

    // 2. Add fields to orders table
    const orderColumns = [
      { name: 'investment_points_earned', type: Sequelize.INTEGER, defaultValue: 0 },
      { name: 'loyalty_points_earned', type: Sequelize.INTEGER, defaultValue: 0 },
      { name: 'reward_multiplier', type: Sequelize.DECIMAL(3, 2), defaultValue: 1.00 },
      { name: 'campaign_id', type: Sequelize.UUID, allowNull: true },
    ];

    for (const col of orderColumns) {
      await queryInterface.addColumn('orders', col.name, {
        type: col.type,
        defaultValue: col.defaultValue,
        allowNull: col.allowNull !== undefined ? col.allowNull : true,
      }).catch(err => console.log(`Column ${col.name} already exists on orders or skipped:`, err.message));
    }

    // 3. Create investment_transactions table
    await queryInterface.createTable('investment_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      source: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      investment_points: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      loyalty_points: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      multiplier: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 1.00,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }).catch(err => console.log('Table investment_transactions creation note:', err.message));

    // 4. Create investment_tier_history table
    await queryInterface.createTable('investment_tier_history', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      previous_tier: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      new_tier: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      investment_points_at_change: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }).catch(err => console.log('Table investment_tier_history creation note:', err.message));

    // 5. Create reward_redemptions table
    await queryInterface.createTable('reward_redemptions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      reward_title: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      reward_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      loyalty_points_spent: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      coupon_code_generated: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(30),
        defaultValue: 'active',
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }).catch(err => console.log('Table reward_redemptions creation note:', err.message));

    // 6. Create engagement_activities table
    await queryInterface.createTable('engagement_activities', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      activity_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      reference_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      ip_awarded: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      lp_awarded: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }).catch(err => console.log('Table engagement_activities creation note:', err.message));
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('engagement_activities');
    await queryInterface.dropTable('reward_redemptions');
    await queryInterface.dropTable('investment_tier_history');
    await queryInterface.dropTable('investment_transactions');
  }
};
