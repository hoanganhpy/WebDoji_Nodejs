const connection = require('../../connectDB');

// Categories and origins for the navigation menus, plus the cart item count for the logged-in user
function getHeader(callback, idTk) {
    connection.query(
        'SELECT * FROM loaisanpham WHERE showw != 0 ; ' +
        'SELECT * FROM xuatxu WHERE showw != 0 ; ' +
        'SELECT COALESCE(SUM(SoLuong), 0) AS n FROM giohang WHERE IDTK = ?',
        [idTk || 0],
        function(err, results) {
            if(err) throw err;
            return callback([results[0], results[1]], Number(results[2][0].n));
        }
    );
}

module.exports = { getHeader };
