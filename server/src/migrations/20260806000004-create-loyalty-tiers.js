'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('loyalty_tiers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      min_points: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      // null = no ceiling (top tier)
      max_points: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      // JSONB: { early_access_hours: 48, birthday_discount_pct: 8, free_shipping: false, invite_events: false }
      perks: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // Loyalty program settings (singleton row)
    await queryInterface.createTable('loyalty_settings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        defaultValue: 1,
      },
      points_per_100_inr: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Points awarded per ₹100 of order total_amount (default: 1)',
      },
      return_flag_threshold_pct: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 40.0,
        comment: 'Return rate % that triggers a flag (default: 40%)',
      },
      return_flag_min_orders: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5,
        comment: 'Minimum orders before flag can trigger',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('loyalty_tiers');
    await queryInterface.dropTable('loyalty_settings');
  },
};
