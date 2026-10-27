const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dojin_nodejs',
  multipleStatements: true
});

connection.connect(function (err) {
  if (err) throw err;
  console.log('Da ket noi database');
});

module.exports = connection;
