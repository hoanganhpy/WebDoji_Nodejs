const statisticalDB = require('../../model/admin/statisticalDB');

const layout = './admin/layoutAdmin';
const today = () => new Date().toLocaleDateString('en-CA');

let getStatis = (req, res) => {
    statisticalDB.ThongKeTrongNgay(function(data) {
        res.render('admin/statistical.ejs', { layout, title: 'Thống kê', active: 'stats', dataStatis: data, dateStart: today(), dateEnd: today() });
    });
}

let search = (req, res) => {
    const dateStart = req.query.dateStart || today();
    const dateEnd = req.query.dateEnd || today();
    statisticalDB.ThongKeSearch(function(data) {
        res.render('admin/statistical.ejs', { layout, title: 'Thống kê', active: 'stats', dataStatis: data, dateStart, dateEnd });
    }, dateStart, dateEnd);
}

module.exports = { getStatis, search };
