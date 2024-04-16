const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'dojin_nodejs',
  multipleStatements: true
});

connection.connect(function(err) {    
  if (err) throw err;    
  console.log('Da ket noi database'); 
}); 

module.exports = connection;
