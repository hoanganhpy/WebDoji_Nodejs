const connection = require('../../connectDB');

// Everything the admin dashboard needs in one round trip
function getDashboard(callback) {
    connection.query(
        // 0: KPIs (cancelled orders excluded from revenue)
        'SELECT ' +
        ' (SELECT COALESCE(SUM(TongTien), 0) FROM hoadon WHERE TrangThai != 3 AND DATE(NgayMua) = CURDATE()) AS revenueToday, ' +
        ' (SELECT COUNT(*) FROM hoadon WHERE TrangThai != 3 AND DATE(NgayMua) = CURDATE()) AS ordersToday, ' +
        ' (SELECT COUNT(*) FROM hoadon WHERE TrangThai = 1) AS pending, ' +
        ' (SELECT COALESCE(SUM(TongTien), 0) FROM hoadon WHERE TrangThai != 3 AND NgayMua >= CURDATE() - INTERVAL 29 DAY) AS revenue30, ' +
        ' (SELECT COUNT(*) FROM sanpham) AS products, ' +
        ' (SELECT COUNT(*) FROM sanpham WHERE SoLuong <= 5) AS lowStock, ' +
        ' (SELECT COUNT(*) FROM taikhoan_kh) AS customers ; ' +
        // 1: revenue per day, last 7 days
        'SELECT DATE_FORMAT(DATE(NgayMua), "%Y-%m-%d") AS d, SUM(TongTien) AS total FROM hoadon ' +
        ' WHERE TrangThai != 3 AND NgayMua >= CURDATE() - INTERVAL 6 DAY GROUP BY DATE(NgayMua) ; ' +
        // 2: best sellers, last 30 days
        'SELECT sanpham.TenSanPham, sanpham.imgName, SUM(cthoadon.SoLuong) AS qty, SUM(cthoadon.ThanhTien) AS total FROM cthoadon ' +
        ' INNER JOIN hoadon ON hoadon.ID = cthoadon.ID_HoaDon INNER JOIN sanpham ON sanpham.ID = cthoadon.IDSanPham ' +
        ' WHERE hoadon.TrangThai != 3 AND hoadon.NgayMua >= CURDATE() - INTERVAL 29 DAY ' +
        ' GROUP BY cthoadon.IDSanPham ORDER BY total DESC LIMIT 5 ; ' +
        // 3: latest orders
        'SELECT hoadon.ID, hoadon.TenKH, hoadon.TongTien, hoadon.TrangThai, trangthai.TenTT, DATE_FORMAT(NgayMua, "%d/%m %H:%i") AS NgayMua ' +
        ' FROM hoadon INNER JOIN trangthai ON trangthai.ID = hoadon.TrangThai ORDER BY hoadon.NgayMua DESC LIMIT 6',
        function(err, r) {
            if(err) throw err;
            // Fill missing days with 0 so the chart always shows 7 points
            const days = [];
            for (let i = 6; i >= 0; i--) {
                const dt = new Date(); dt.setDate(dt.getDate() - i);
                const key = dt.toLocaleDateString('en-CA');
                const row = r[1].find((x) => x.d === key);
                days.push({ label: dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }), total: row ? Number(row.total) : 0 });
            }
            return callback({ kpi: r[0][0], days, top: r[2], latest: r[3] });
        }
    );
}

module.exports = { getDashboard };
