const homeDB = require('../../model/admin/homeDB');

const layout = './admin/layoutAdmin';

let getHome = (req, res) => {
    homeDB.getDashboard((data) => {
        res.render('admin/homeAdmin.ejs', { layout, title: 'Tổng quan', active: 'home', ...data });
    });
}

module.exports = { getHome };
