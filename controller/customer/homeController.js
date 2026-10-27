const homeDB = require('../../model/customer/homeDB');

const layout = './customer/layoutCustomer';

let getHome = (req, res) => {
    homeDB.getHome((data) => {
        res.render('customer/home.ejs', { layout: layout, title: 'Trang sức tinh xảo', dataHomeLsp: data[0], dataHomeSp: data[1] });
    });
}

module.exports = { getHome };
