require('./env')

const isProduction = process.env.NODE_ENV === 'production';
const useNeon = isProduction || process.env.USE_NEON === 'true';

const dbConfig = useNeon && process.env.DATABASE_URL
  ? {
      url: process.env.DATABASE_URL,
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging: false,
    }
  : {
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'elesene',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
    };

module.exports = {
  development: dbConfig,
  test: dbConfig,
  production: dbConfig,
};
