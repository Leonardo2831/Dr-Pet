const mysql = require('mysql2');

const db = mysql.createPool({
    // porta padrão da faculdade é 3306, mas meu pc é 3308
    port: 3306,
    host: 'localhost',
    user: 'root',
    database: 'petshop',
    password: '1234',
});

module.exports = db;