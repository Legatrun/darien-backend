require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'rootpassword',
    database: process.env.DB_NAME || 'reservation_iot_db',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    retry: {
      max: 10,
    }
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'rootpassword',
    database: 'database_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    retry: {
      max: 10,
    }
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    retry: {
      max: 10,
    }
  }
};
