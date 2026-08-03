const { Sequelize } = require('sequelize');
require('../config/env')

const isProduction = process.env.NODE_ENV === 'production';
const useNeon = isProduction || process.env.USE_NEON === 'true';

if (useNeon && !process.env.DATABASE_URL) {
  throw new Error("FATAL: DATABASE_URL environment variable is required in production or when USE_NEON is true.");
}

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is required in production mode.");
}

const DATABASE_URL = process.env.DATABASE_URL;

let sequelize;

if (useNeon) {
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
