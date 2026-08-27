const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME
});

module.exports = pool;

// const pool = mysql.createPool({
//     host: '127.0.0.1',
//     port: 3308,
//     // host: process.env.DB_HOST,
//     // port: process.env.DB_PORT,
//     user: 'root', 
//     password: '',
//     database: 'estacionamento_teste'
// });