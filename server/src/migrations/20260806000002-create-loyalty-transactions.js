'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('loyalty_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'orders', key: 'id' },
        onDelete: 'SET NULL',
      },
      type: {
        type: Sequelize.ENUM('earn', 'spend', 'reversal', 'adjustment'),
        allowNull: false,
      },
      points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Positive = credit, negative = debit',
      },
      balance_after: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Snapshot of balance after this transaction',
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'Admin user ID for manual adjustments',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('loyalty_transactions', ['user_id'], { name: 'idx_lt_user_id' });
    await queryInterface.addIndex('loyalty_transactions', ['order_id'], { name: 'idx_lt_order_id' });
    await queryInterface.addIndex('loyalty_transactions', ['created_at'], { name: 'idx_lt_created_at' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('loyalty_transactions');
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_loyalty_transactions_type"`);
  },
};
