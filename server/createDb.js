const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
});

async function createDatabase() {
  try {
    await client.connect();
    const res = await client.query("SELECT datname FROM pg_database WHERE datname = 'elesene'");
    if (res.rowCount === 0) {
      console.log('Database not found, creating it.');
      await client.query('CREATE DATABASE "elesene"');
      console.log('Database elesene created successfully.');
    } else {
      console.log('Database elesene already exists.');
    }
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await client.end();
  }
}

createDatabase();
