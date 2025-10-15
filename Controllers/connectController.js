const mysql = require("mysql2");

const pool = mysql.createPool({
    connectionLimit: 10, 
    host: "localhost",
    user: "root",
    password: "Daniyar", 
    database: "Comp",
    waitForConnections: true,
    queueLimit: 0
});

let cart = []; // Корзина в виде массива

module.exports.pool = pool;
module.exports.cart = cart;