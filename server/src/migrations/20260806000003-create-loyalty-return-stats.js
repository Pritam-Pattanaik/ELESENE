'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('loyalty_return_stats', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      total_orders: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_returns: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      // Reason-weighted return count (size/fit = 0.5, changed_mind = 1.0)
      weighted_returns: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0,
      },
      // weighted_returns / total_orders * 100 — stored for fast flag evaluation
      return_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      is_flagged: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      flag_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      flagged_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      // 'none' | 'soft' | 'medium' | 'hard'
      restriction_level: {
        type: Sequelize.ENUM('none', 'soft', 'medium', 'hard'),
        allowNull: false,
        defaultValue: 'none',
      },
      restriction_note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      restriction_set_by: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      restriction_set_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('loyalty_return_stats', ['is_flagged'], { name: 'idx_lrs_flagged' });
    await queryInterface.addIndex('loyalty_return_stats', ['return_rate'], { name: 'idx_lrs_rate' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('loyalty_return_stats');
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_loyalty_return_stats_restriction_level"`);
  },
};
