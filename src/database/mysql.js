require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createPool({
    port: Number(process.env.DB_PORT),
    host: process.env.DB_HOST.toString(),
    user: process.env.DB_USER.toString(),
    database: process.env.DB_NAME.toString(),
    password: process.env.DB_PASSWORD.toString()
});

module.exports = db;