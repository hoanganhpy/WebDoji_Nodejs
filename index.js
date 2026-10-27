const express = require("express");
const expressLayouts = require('express-ejs-layouts');
const initAdminRouter = require('./route/admin/initAdminRouter');
const initCustomerRouter = require('./route/customer/initCustomerRouter');
const fileUpload = require('express-fileupload');
var cookieParser = require('cookie-parser');

let session = require('express-session');


const app = express();
const port = process.env.PORT || 3000;

const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me-in-production';
app.use(cookieParser(SESSION_SECRET));

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  }))

app.use(fileUpload({
    tempFilePath: true
}));
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

app.use(express.static('./public'));

app.set('view engine', 'ejs');
// Currency helper available in every view: 12500000 -> 12.500.000
app.locals.vnd = (n) => Number(n || 0).toLocaleString('vi-VN');
app.use(expressLayouts);

initAdminRouter(app);
initCustomerRouter(app);

app.get('*', function(req, res){
    res.status(404).render('404.ejs', {layout: './404'});
});
// app.set('layout', './customer/nolayout');


app.listen(port, () => {
    console.log(`Run http://localhost:${port}/customer/home`)
})