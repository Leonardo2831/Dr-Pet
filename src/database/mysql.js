const mysql = require('mysql2');

const db = mysql.createConnection({
    // porta padrão da faculdade é 3306, mas meu pc é 3308
    port: 3308,
    host: 'localhost',
    user: 'root',
    database: 'dr-pet',
    password: '1234',
});

module.exports = db;