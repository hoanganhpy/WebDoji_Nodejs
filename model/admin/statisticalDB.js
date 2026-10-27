const connection = require('../../connectDB');

function ThongKeTrongNgay(callback) {
    connection.query(
        'SELECT IDSanPham, sanpham.TenSanPham, SUM(cthoadon.SoLuong) as SoLuong, sum(ThanhTien) as ThanhTien, sanpham.GiaBan FROM cthoadon ' +
        ' INNER JOIN hoadon ON cthoadon.ID_HoaDon = hoadon.ID ' +
        ' INNER JOIN sanpham ON sanpham.ID = cthoadon.IDSanPham' +
        ' WHERE DATE(NgayMua) = CURDATE() AND hoadon.TrangThai != 3 '+
        ' GROUP BY IDSanPham ',
        function(err, results) {
            if(err) throw err;
            return callback(results);
        }
      );
}

function ThongKeSearch(callback, dateStart, dateEnd) {
    connection.query(
        'SELECT IDSanPham, sanpham.TenSanPham, SUM(cthoadon.SoLuong) as SoLuong, sum(ThanhTien) as ThanhTien, sanpham.GiaBan FROM cthoadon ' +
        ' INNER JOIN hoadon ON cthoadon.ID_HoaDon = hoadon.ID ' +
        ' INNER JOIN sanpham ON sanpham.ID = cthoadon.IDSanPham' +
        ' WHERE DATE(NgayMua) BETWEEN ? AND ? AND hoadon.TrangThai != 3 '+
        ' GROUP BY IDSanPham ',
        [dateStart, dateEnd],
        function(err, results) {
            if(err) throw err;
            return callback(results);
        }
      );
}

module.exports = {ThongKeTrongNgay, ThongKeSearch};