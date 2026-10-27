const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const expressLayouts = require('express-ejs-layouts');
const initAdminRouter = require('./route/admin/initAdminRouter');
const initCustomerRouter = require('./route/customer/initCustomerRouter');
const fileUpload = require('express-fileupload');
var cookieParser = require('cookie-parser');

let session = require('express-session');


const app = express();
app.disable('x-powered-by');

// Security headers. Inline scripts/styles are still used by the EJS views.
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
            fontSrc: ["'self'"],
            upgradeInsecureRequests: null,
        },
    },
}));

// Slow down password guessing on both login forms
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false,
    message: 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.' });
app.post(['/customer/login', '/admin/login'], loginLimiter);
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

// Front-end libraries and fonts are served from node_modules (no CDN needed)
const vendor = (pkg) => express.static(require('path').join(__dirname, 'node_modules', pkg), { maxAge: '7d' });
app.use('/vendor/bootstrap', vendor('bootstrap/dist'));
app.use('/vendor/bootstrap-icons', vendor('bootstrap-icons/font'));
app.use('/vendor/chart.js', vendor('chart.js/dist'));
app.use('/vendor/fonts/playfair-display', vendor('@fontsource/playfair-display'));
app.use('/vendor/fonts/be-vietnam-pro', vendor('@fontsource/be-vietnam-pro'));

app.set('view engine', 'ejs');
// Currency helper available in every view: 12500000 -> 12.500.000
app.locals.vnd = (n) => Number(n || 0).toLocaleString('vi-VN');
app.use(expressLayouts);

// Data every storefront page needs: navigation menus, logged-in user, cart badge
const headerDB = require('./model/customer/headerDB');
app.use('/customer', (req, res, next) => {
    res.locals.sessionID = req.signedCookies.dataLogin;
    res.locals.currentPath = req.originalUrl;
    headerDB.getHeader((menus, cartCount) => {
        res.locals.dataHeaderSp = menus[0];
        res.locals.dataHeaderXx = menus[1];
        res.locals.cartCount = cartCount;
        next();
    }, res.locals.sessionID && res.locals.sessionID.ID);
});

app.use('/admin', (req, res, next) => { res.locals.currentPath = req.originalUrl; next(); });

app.get('/', (req, res) => res.redirect('/customer/home'));

initAdminRouter(app);
initCustomerRouter(app);

app.get('*', function(req, res){
    res.status(404).render('404.ejs', {layout: false});
});

// Last-resort error handler: log it and show a friendly page instead of a stack trace
app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);
    res.status(500).send('<h1 style="font-family:sans-serif">Đã có lỗi xảy ra</h1><p style="font-family:sans-serif">Vui lòng thử lại sau.</p>');
});

// A DB error thrown inside a query callback can't be recovered safely: log and exit,
// and let the process manager (pm2, systemd, Docker) restart the app.
process.on('uncaughtException', (err) => {
    console.error('Fatal error, shutting down:', err);
    process.exit(1);
});
// app.set('layout', './customer/nolayout');


app.listen(port, () => {
    console.log(`Run http://localhost:${port}/customer/home`)
})