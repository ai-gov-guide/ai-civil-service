const mariadb = require('mariadb');
require('dotenv').config();

// DB 연결 pool
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5 // 최대 동시 연결 수
});

module.exports = pool;