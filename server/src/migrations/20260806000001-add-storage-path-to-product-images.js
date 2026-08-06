'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('product_images', 'storage_path', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Supabase Storage object path (e.g. "<product-id>/timestamp.webp") for deletion via the Storage API. NULL for legacy URL-pasted or disk-stored images.',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('product_images', 'storage_path');
  },
};
