const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use Neon in production, local PostgreSQL for development
const isProduction = process.env.NODE_ENV === 'production';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_8aG3ohpbFnZD@ep-lively-salad-aoedxv9p-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

let sequelize;

if (isProduction || process.env.USE_NEON === 'true') {
  // Neon PostgreSQL (cloud)
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
    pool: { max: 3, min: 0, acquire: 60000, idle: 10000 }
  });
} else {
  // Local PostgreSQL (development)
  sequelize = new Sequelize(
    process.env.DB_NAME || 'elesene',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'postgres',
      logging: false,
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    }
  );
}

module.exports = sequelize;
