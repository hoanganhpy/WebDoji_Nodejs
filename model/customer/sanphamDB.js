const connection = require('../../connectDB');

function format_date(date) {
    return date.getFullYear() + "/" +
    ("0" + (date.getMonth()+1)).slice(-2) + "/" +
    ("0" + date.getDate()).slice(-2) + " " +
    ("0" + date.getHours()).slice(-2) + ":" +
    ("0" + date.getMinutes()).slice(-2) + ":" +
    ("0" + date.getSeconds()).slice(-2);
}

function getDetail(callback, idSP, idLsp) {
    connection.query(
        'SELECT sanpham.ID, ID_LoaiSanPham, xuatxu.ID as ID_XuatXu, loaisanpham.Ten as LoaiSanPham, imgName, TenSanPham, GiaNhap, GiaBan, SoLuong, xuatxu.XuatXu, show_sp, show_lsp, show_xx FROM sanpham INNER JOIN loaisanpham ON loaisanpham.ID = sanpham.ID_LoaiSanPham INNER JOIN xuatxu ON xuatxu.ID = sanpham.XuatXu WHERE sanpham.ID = ? AND show_sp != 0 AND show_lsp != 0 AND show_xx != 0 ; ' + 
        'SELECT sanpham.ID, sanpham.ID_LoaiSanPham, sanpham.TenSanPham, sanpham.imgName, sanpham.GiaBan, sanpham.SoLuong, sanpham.show_lsp, sanpham.show_xx, sanpham.show_sp, xuatxu.XuatXu FROM sanpham INNER JOIN xuatxu ON xuatxu.ID = sanpham.XuatXu WHERE show_xx != 0 AND show_sp != 0 AND show_lsp != 0 AND ID_LoaiSanPham = ? AND sanpham.ID != ? ORDER BY sanpham.update_at DESC ',
        [idSP, idLsp, idSP],
        function(err, results) {
            if(err) throw err;
            return callback(results);
        }
      );
}

function getLoaiSanPham(callback, idLsp) {
    connection.query(
        'SELECT sanpham.ID, sanpham.ID_LoaiSanPham, loaisanpham.Ten,sanpham.TenSanPham, sanpham.imgName, sanpham.GiaBan, sanpham.SoLuong, sanpham.show_lsp, sanpham.show_xx, sanpham.show_sp, xuatxu.XuatXu ' +
        'FROM sanpham ' +
        'INNER JOIN xuatxu ON xuatxu.ID = sanpham.XuatXu ' +
        'INNER JOIN loaisanpham ON loaisanpham.ID = sanpham.ID_LoaiSanPham ' +
        'WHERE show_xx != 0 AND show_sp != 0 AND show_lsp != 0 AND ID_LoaiSanPham = ? ORDER BY sanpham.update_at DESC ',
        [idLsp],
        function(err, results) {
            if(err) throw err;
            return callback(results);
        }
      );
}

function getXuatXu(callback, idLsp) {
    connection.query(
        'SELECT sanpham.ID, sanpham.ID_LoaiSanPham, loaisanpham.Ten,sanpham.TenSanPham, sanpham.imgName, sanpham.GiaBan, sanpham.SoLuong, sanpham.show_lsp, sanpham.show_xx, sanpham.show_sp, xuatxu.XuatXu ' +
        'FROM sanpham ' +
        'INNER JOIN xuatxu ON xuatxu.ID = sanpham.XuatXu ' +
        'INNER JOIN loaisanpham ON loaisanpham.ID = sanpham.ID_LoaiSanPham ' +
        'WHERE show_xx != 0 AND show_sp != 0 AND show_lsp != 0 AND sanpham.XuatXu = ? ORDER BY sanpham.update_at DESC ',
        [idLsp],
        function(err, results) {
            if(err) throw err;
            return callback(results);
        }
      );
}

function searchSanPham(callback, key) {
    let keyy = '%' + key + '%';
    connection.query(
        'SELECT sanpham.ID, sanpham.ID_LoaiSanPham, loaisanpham.Ten,sanpham.TenSanPham, sanpham.imgName, sanpham.GiaBan, sanpham.SoLuong, sanpham.show_lsp, sanpham.show_xx, sanpham.show_sp, xuatxu.XuatXu ' +
        'FROM sanpham ' +
        'INNER JOIN xuatxu ON xuatxu.ID = sanpham.XuatXu ' +
        'INNER JOIN loaisanpham ON loaisanpham.ID = sanpham.ID_LoaiSanPham ' +
        'WHERE show_xx != 0 AND show_sp != 0 AND show_lsp != 0 AND sanpham.TenSanPham LIKE ? ORDER BY sanpham.update_at DESC ',
        [keyy],
        function(err, results) {
            if(err) throw err;
            return callback(results);
        }
      );
}

function isCart(callback, idTk, idSp) {
    connection.query(
        'SELECT * FROM giohang WHERE giohang.IDTK = ? AND giohang.IDSanPham = ?',
        [idTk, idSp],
        function(err, results) {
            if(err) throw err;
            return callback(results);
        }
      );
}

function addToCart(callback, data, idTk) {
    // Price, name and stock are read from the database, never trusted from the form.
    const qty = parseInt(data.SoLuongMua, 10);
    if (!(qty > 0)) return callback(null);
    connection.query(
        'SELECT sanpham.TenSanPham, sanpham.GiaBan, sanpham.SoLuong, xuatxu.XuatXu FROM sanpham ' +
        'INNER JOIN xuatxu ON xuatxu.ID = sanpham.XuatXu WHERE sanpham.ID = ?',
        [data.idSp],
        function(err, rows) {
            if(err) throw err;
            const sp = rows[0];
            if (!sp || sp.SoLuong < qty) return callback(null);
            isCart((dataCart) => {
                const sql = !dataCart[0]
                    ? 'INSERT INTO giohang(IDTK, IDSanPham, TenSanPham, XuatXu, DonGia, SoLuong, ThanhTien) VALUES (?,?,?,?,?,?,?) ; '
                    : 'UPDATE giohang SET SoLuong = SoLuong + ?, ThanhTien = DonGia * SoLuong WHERE IDTK = ? AND IDSanPham = ? ; ';
                const params = !dataCart[0]
                    ? [idTk, data.idSp, sp.TenSanPham, sp.XuatXu, sp.GiaBan, qty, sp.GiaBan * qty]
                    : [qty, idTk, data.idSp];
                connection.query(
                    sql + 'UPDATE sanpham SET SoLuong = SoLuong - ? WHERE ID = ?',
                    params.concat([qty, data.idSp]),
                    function(err, results) {
                        if(err) throw err;
                        return callback(results);
                    }
                );
            }, idTk, data.idSp);
        }
    );
}

function getCart(callback, idTk) {
    connection.query(
        'SELECT giohang.*, sanpham.imgName, sanpham.SoLuong as SoLuongSpTrongKho FROM giohang INNER JOIN sanpham ON sanpham.ID = giohang.IDSanPham WHERE giohang.IDTK = ?',
        [idTk],
        function(err, results) {
            if(err) throw err;
            return callback(results);
        }
      );
}

function updateCart(callback, idTk, data){
    // The previous quantity comes from the database, so stock can't be inflated from the form.
    const SoLuong = parseInt(data.SoLuong, 10);
    if (!(SoLuong > 0)) return callback();
    connection.query(
        'SELECT giohang.SoLuong, sanpham.SoLuong AS TonKho FROM giohang INNER JOIN sanpham ON sanpham.ID = giohang.IDSanPham ' +
        'WHERE giohang.IDTK = ? AND giohang.IDSanPham = ?',
        [idTk, data.idSanPham],
        function(err, rows) {
            if(err) throw err;
            if (!rows[0]) return callback();
            const diff = SoLuong - rows[0].SoLuong;          // > 0: take more from stock, < 0: give back
            if (diff === 0 || diff > rows[0].TonKho) return callback();
            connection.query(
                'UPDATE giohang SET SoLuong = ?, ThanhTien = DonGia * SoLuong WHERE IDTK = ? AND IDSanPham = ? ;' +
                'UPDATE sanpham SET SoLuong = SoLuong - ? WHERE ID = ?',
                [SoLuong, idTk, data.idSanPham, diff, data.idSanPham],
                function(err, results) {
                    if(err) throw err;
                    return callback(results);
                }
            );
        }
    );
}

function deleteCart(callback, data, idTk) {
    // Restock using the quantity stored in the cart, only for the owner's cart row.
    connection.query(
        'UPDATE sanpham INNER JOIN giohang ON giohang.IDSanPham = sanpham.ID ' +
        'SET sanpham.SoLuong = sanpham.SoLuong + giohang.SoLuong WHERE giohang.ID = ? AND giohang.IDTK = ? ; ' +
        'DELETE FROM giohang WHERE ID = ? AND IDTK = ?',
        [data.idCart, idTk, data.idCart, idTk],
        function(err, results) {
            if(err) throw err;
            return callback(results);
        }
      );
}

function orderCart(callback, data, idTk) {
    // Each order is built from this user's cart in the database (not a shared in-memory array),
    // and the total is computed server-side.
    connection.query('SELECT IDSanPham, SoLuong, ThanhTien FROM giohang WHERE IDTK = ?', [idTk], function(err, cart) {
        if(err) throw err;
        if (!cart.length) return callback(null);
        const total = cart.reduce((sum, row) => sum + Number(row.ThanhTien), 0);
        const diachi = [data.DiaChiCuThe, data.xa, data.quanhuyen, data.tinhtp].join(' - ');
        connection.query(
            'INSERT INTO hoadon(IDTK, TenKH, DiaChi, SDT, TongTien, NgayMua, GhiChu, TrangThai) VALUES (?, ?, ?, ?, ?, NOW(), ?, 1)',
            [idTk, data.ho_ten, diachi, data.sdt, total, data.ghi_chu],
            function(err, hd) {
                if(err) throw err;
                const lines = cart.map(row => [hd.insertId, row.IDSanPham, row.SoLuong, row.ThanhTien]);
                connection.query(
                    'INSERT INTO cthoadon(ID_HoaDon, IDSanPham, SoLuong, ThanhTien) VALUES ? ; DELETE FROM giohang WHERE IDTK = ?',
                    [lines, idTk],
                    function(err, results) {
                        if(err) throw err;
                        return callback(results);
                    }
                );
            }
        );
    });
}

function donHang(callback, idTk) {
    connection.query(
        'SELECT TenKH, DiaChi, SDT, TongTien, NgayMua, GhiChu, hoadon.TrangThai, trangthai.TenTT, hoadon.ID FROM hoadon ' + 
        'INNER JOIN trangthai ON trangthai.ID = hoadon.TrangThai WHERE IDTK = ? AND TrangThai = 1 ORDER BY NgayMua DESC ',
        [idTk],
        function(err, results) {
            if(err) throw err;
            results.forEach(data => {
                data.NgayMua = format_date(data.NgayMua);
            });
            return callback(results);
        }
      );
}

function lichSuDonHang(callback, idTk) {
    connection.query(
        'SELECT TenKH, DiaChi, SDT, TongTien, NgayMua, GhiChu, hoadon.TrangThai, trangthai.TenTT, hoadon.ID FROM hoadon ' +
        'INNER JOIN trangthai ON trangthai.ID = hoadon.TrangThai WHERE IDTK = ? AND (TrangThai = 2 OR TrangThai = 3) ORDER BY NgayMua DESC ',
        [idTk],
        function(err, results) {
            if(err) throw err;
            results.forEach(data => {
                data.NgayMua = format_date(data.NgayMua);
            });
            return callback(results);
        }
      );
}

function chiTietDonHang(callback, idDh, idTk){
    // Only the owner can see an order; unit price is the price paid, not today's price
    connection.query(
        'SELECT hoadon.ID, TenKH, DiaChi, SDT, TongTien, NgayMua, GhiChu, hoadon.TrangThai, trangthai.TenTT FROM hoadon ' +
        'INNER JOIN trangthai ON trangthai.ID = hoadon.TrangThai WHERE hoadon.ID = ? AND hoadon.IDTK = ? ;' +
        'SELECT sanpham.ID, sanpham.ID_LoaiSanPham, sanpham.TenSanPham, sanpham.imgName, xuatxu.XuatXu, ' +
        'cthoadon.ThanhTien / cthoadon.SoLuong as DonGia, cthoadon.SoLuong, cthoadon.ThanhTien ' +
        'FROM cthoadon ' +
        'INNER JOIN hoadon ON hoadon.ID = cthoadon.ID_HoaDon ' +
        'INNER JOIN sanpham ON sanpham.ID = cthoadon.IDSanPham ' +
        'INNER JOIN xuatxu ON xuatxu.ID = sanpham.XuatXu ' +
        'WHERE cthoadon.ID_HoaDon = ? AND hoadon.IDTK = ?',
        [idDh, idTk, idDh, idTk],
        function(err, results) {
            if(err) throw err;
            results[0].forEach(data => {
                data.NgayMua = format_date(data.NgayMua);
            });
            return callback(results);
        }
      );
}

function huyDonHang(callback, idDh, idTk){
    // Customers can cancel their own order while it is still pending; items go back to stock
    connection.query(
        'UPDATE sanpham INNER JOIN cthoadon ON cthoadon.IDSanPham = sanpham.ID INNER JOIN hoadon ON hoadon.ID = cthoadon.ID_HoaDon ' +
        'SET sanpham.SoLuong = sanpham.SoLuong + cthoadon.SoLuong WHERE hoadon.ID = ? AND hoadon.IDTK = ? AND hoadon.TrangThai = 1 ; ' +
        'UPDATE hoadon SET TrangThai = 3 WHERE ID = ? AND IDTK = ? AND TrangThai = 1',
        [idDh, idTk, idDh, idTk],
        function(err, results) {
            if(err) throw err;
            return callback(results);
        }
    );
}

module.exports = {
    getDetail, getLoaiSanPham, getXuatXu, searchSanPham, addToCart, getCart, updateCart,
    deleteCart, orderCart, donHang, chiTietDonHang, lichSuDonHang, huyDonHang
};
