'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('order', 'wishlist', 'promo', 'account', 'system'),
        defaultValue: 'system',
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      data: {
        type: Sequelize.JSONB,
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
    });

    await queryInterface.addIndex('notifications', ['user_id'], { name: 'idx_notifications_user' });
    await queryInterface.addIndex('notifications', ['user_id', 'is_read'], { name: 'idx_notifications_user_read' });
    await queryInterface.addIndex('notifications', ['created_at'], { name: 'idx_notifications_created' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('notifications', 'idx_notifications_created');
    await queryInterface.removeIndex('notifications', 'idx_notifications_user_read');
    await queryInterface.removeIndex('notifications', 'idx_notifications_user');
    await queryInterface.dropTable('notifications');
  }
};
