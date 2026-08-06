'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Get all user tables in the public schema
    const [tables] = await queryInterface.sequelize.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
    );

    // 2. Enable Row Level Security (RLS) on each table
    for (const row of tables) {
      const tableName = row.tablename;
      // Skip SequelizeMeta table to prevent locking metadata updates
      if (tableName === 'SequelizeMeta') continue;
      
      console.log(`Enabling RLS on table: ${tableName}`);
      await queryInterface.sequelize.query(
        `ALTER TABLE "${tableName}" ENABLE ROW LEVEL SECURITY;`
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // 1. Get all user tables in the public schema
    const [tables] = await queryInterface.sequelize.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
    );

    // 2. Disable Row Level Security (RLS) on each table
    for (const row of tables) {
      const tableName = row.tablename;
      if (tableName === 'SequelizeMeta') continue;

      console.log(`Disabling RLS on table: ${tableName}`);
      await queryInterface.sequelize.query(
        `ALTER TABLE "${tableName}" DISABLE ROW LEVEL SECURITY;`
      );
    }
  }
};
