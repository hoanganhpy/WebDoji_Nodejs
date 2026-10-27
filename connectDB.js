const mysql = require('mysql2');

// A pool reconnects automatically if MySQL restarts or drops idle connections
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dojin_nodejs',
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

pool.getConnection((err, conn) => {
  if (err) {
    console.error('Cannot connect to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Connected to MySQL');
  conn.release();
});

module.exports = pool;
