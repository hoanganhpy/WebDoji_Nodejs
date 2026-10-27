const homeDB = require('../../model/customer/homeDB');
// const header = require('../customer/headerController');
const headerDB = require('../../model/customer/headerDB');

const layout = './customer/layoutCustomer';
let header
headerDB.getHeader((data) => {
    header = data
})
let getHome = (req, res) => {
    // console.log(header);
    homeDB.getHome((data) => {
        // console.log(req.signedCookies.dataLogin);
        res.render('customer/home.ejs', {layout: layout, sessionID: req.signedCookies.dataLogin, dataHeaderSp: header[0], dataHeaderXx: header[1], dataHomeLsp: data[0], dataHomeSp: data[1]});
        res.end();
    })
}

module.exports = {
    getHome
}