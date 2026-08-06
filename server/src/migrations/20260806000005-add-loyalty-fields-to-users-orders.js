'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add loyalty_tier to users (denormalized for fast reads)
    await queryInterface.addColumn('users', 'loyalty_tier', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'Member',
    });

    // Add return_reason_code to orders (captured on return/refund)
    await queryInterface.addColumn('orders', 'return_reason_code', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'size_fit | damaged_on_arrival | wrong_item_received | defective | changed_mind | found_cheaper | no_longer_needed | pattern_return',
    });

    // Add points_awarded to orders (needed for exact reversal amount)
    await queryInterface.addColumn('orders', 'points_awarded', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'loyalty_tier');
    await queryInterface.removeColumn('orders', 'return_reason_code');
    await queryInterface.removeColumn('orders', 'points_awarded');
  },
};
