const mysql = require('mysql2/promise');
//require('dotenv').config();

const pool = mysql.createPool({
    host: 'localhost',
    port: 3308,
    user: 'root', 
    password: '',
    database: 'estacionamento_teste'
});

module.exports = pool;
