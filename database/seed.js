// Seed demo data: node database/seed.js  (run after schema.sql)
const fs = require('fs');
const path = require('path');
const db = require('../connectDB');

const IMG = path.join(__dirname, '..', 'public', 'admin', 'image');
const b64 = (f) => fs.readFileSync(path.join(IMG, f), 'base64');

const categories = ['Nhẫn', 'Lắc tay', 'Dây chuyền', 'Vòng tay'];
const origins = ['Việt Nam', 'Ý', 'Hàn Quốc'];
// [category, origin, image, name, cost, price, stock]
const products = [
  [1, 1, 'sp-gnddddw012437-nhan-kim-cuong-vang-trang-14k-pnj-1.png', 'Nhẫn kim cương vàng trắng 14K', 9800000, 12500000, 12],
  [1, 1, 'sp-gnddddy060011-nhan-kim-cuong-vang-14k-pnj-1.png', 'Nhẫn kim cương vàng 14K', 10500000, 13900000, 8],
  [1, 3, 'SP-nhan-vang-trang-10k-dinh-da-synthetic-style-by-pnj-lucky-me-ztmxw000024-1.png', 'Nhẫn vàng trắng 10K đính đá', 2100000, 2890000, 25],
  [1, 3, 'snd2kn14183.100-nhan-bac-pnjsilver-dinh-da.png', 'Nhẫn bạc đính đá', 380000, 595000, 40],
  [2, 2, 'sp-gl0000w001275-lac-tay-vang-trang-y-18k-pnj-1.png', 'Lắc tay vàng trắng Ý 18K', 11200000, 14600000, 6],
  [2, 1, 'sp-glddddw000851-lac-tay-kim-cuong-vang-trang-14k-pnj-kim-bao-nhu-y-1.png', 'Lắc tay kim cương vàng trắng 14K', 15800000, 19900000, 5],
  [2, 1, 'sp-glxmxmy001012-lac-tay-vang-18k-dinh-da-ecz-pnj-1.png', 'Lắc tay vàng 18K đính đá ECZ', 7600000, 9850000, 10],
  [3, 2, 'sp-gcddddw000667-day-co-kim-cuong-vang-trang-14k-pnj-chu-t-1.png', 'Dây cổ kim cương vàng trắng 14K', 13400000, 16800000, 7],
  [3, 2, 'sp-gmdd00w000645-mat-day-chuyen-kim-cuong-vang-trang-14k-pnj-chu-p-1.png', 'Mặt dây chuyền kim cương 14K', 6200000, 7990000, 15],
  [4, 1, 'gv0000y000044-vong-tay-tre-em-vang-18k-pnj-1.png', 'Vòng tay trẻ em vàng 18K', 4300000, 5650000, 18],
];

const q = (sql, params = []) => new Promise((ok, fail) => db.query(sql, params, (e, r) => (e ? fail(e) : ok(r))));

(async () => {
  await q('SET FOREIGN_KEY_CHECKS=0; TRUNCATE cthoadon; TRUNCATE hoadon; TRUNCATE giohang; TRUNCATE sanpham; TRUNCATE loaisanpham; TRUNCATE xuatxu; TRUNCATE taikhoan_kh; TRUNCATE taikhoan_admin; SET FOREIGN_KEY_CHECKS=1;');
  for (const c of categories) await q('INSERT INTO loaisanpham(Ten, NgayThem, update_at) VALUES (?, now(), now())', [c]);
  for (const o of origins) await q('INSERT INTO xuatxu(XuatXu, NgayThem, update_at) VALUES (?, now(), now())', [o]);
  for (const [i, p] of products.entries()) {
    await q(
      'INSERT INTO sanpham(ID_LoaiSanPham, imgName, Image, TenSanPham, GiaNhap, GiaBan, SoLuong, NgayNhap, update_at, XuatXu) VALUES (?,?,?,?,?,?,?, now(), now() - INTERVAL ? MINUTE, ?)',
      [p[0], p[2], b64(p[2]), p[3], p[4], p[5], p[6], i, p[1]]
    );
  }
  await q("INSERT INTO taikhoan_admin(TenTK, MatKhau) VALUES ('admin', SHA2('admin123', 256))");
  await q("INSERT INTO taikhoan_kh(TenTK, MatKhau, TrangThai, NgayDK) VALUES ('demo', SHA2('123456', 256), 1, now() - INTERVAL 30 DAY), ('lananh', SHA2('123456', 256), 1, now() - INTERVAL 12 DAY), ('minhtuan', SHA2('123456', 256), 1, now() - INTERVAL 3 DAY)");

  // Orders: [user, name, address, phone, daysAgo, status, items[[productId, qty]]]
  const people = [
    [1, 'Nguyễn Văn An', '12 Lê Lợi - Phường Bến Nghé - Quận 1 - TP. Hồ Chí Minh', '0901234567'],
    [2, 'Trần Lan Anh', '45 Trần Phú - Phường 4 - Quận 5 - TP. Hồ Chí Minh', '0912345678'],
    [3, 'Lê Minh Tuấn', '8 Nguyễn Huệ - Phường Phú Hội - TP. Huế - Thừa Thiên Huế', '0987654321'],
  ];
  // [person, daysAgo, status, items[[productId, qty]]]  status: 1 pending, 2 delivered, 3 cancelled
  const orders = [
    [0, 6, 2, [[3, 1], [4, 2]]], [1, 6, 2, [[9, 1]]],
    [2, 5, 2, [[10, 1]]], [0, 5, 3, [[2, 1]]],
    [1, 4, 2, [[5, 1], [4, 1]]], [2, 4, 2, [[7, 1]]],
    [0, 3, 2, [[8, 1]]], [1, 3, 2, [[3, 2]]],
    [2, 2, 2, [[6, 1]]],
    [0, 1, 2, [[1, 1], [9, 1]]], [1, 1, 2, [[7, 1], [4, 1]]],
    [2, 0, 2, [[10, 1], [3, 1]]], [1, 0, 1, [[5, 1]]], [0, 0, 1, [[1, 1], [4, 2]]],
  ].map(([who, ago, st, items]) => [...people[who].slice(0, 1), ...people[who].slice(1, 2), people[who][2], people[who][3], ago, st, items]);
  for (const [u, name, addr, phone, ago, st, items] of orders) {
    const lines = items.map(([pid, n]) => [pid, n, products[pid - 1][5] * n]);
    const total = lines.reduce((s, l) => s + l[2], 0);
    const r = await q('INSERT INTO hoadon(IDTK, TenKH, DiaChi, SDT, TongTien, NgayMua, GhiChu, TrangThai) VALUES (?,?,?,?,?, now() - INTERVAL ? DAY - INTERVAL ? MINUTE, ?, ?)',
      [u, name, addr, phone, total, ago, Math.floor(Math.random() * 300), '', st]);
    for (const l of lines) await q('INSERT INTO cthoadon(ID_HoaDon, IDSanPham, SoLuong, ThanhTien) VALUES (?,?,?,?)', [r.insertId, ...l]);
  }
  console.log('Seed done. Admin: admin / admin123 — Customer: demo / 123456');
  db.end();
})().catch((e) => { console.error(e); process.exit(1); });
