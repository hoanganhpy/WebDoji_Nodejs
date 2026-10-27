const loginDB = require('../../model/customer/loginDB');

const page = (res, view, data = {}) =>
    res.render('customer/' + view, { layout: 'customer/layoutAuth', error: '', ...data });

let viewLogin = (req, res) => {
    res.clearCookie('dataLogin');
    page(res, 'loginCustomer.ejs', { title: 'Đăng nhập' });
}

let postLogin = (req, res) => {
    loginDB.selectLogin(function(data){
        if (!data[0]) {
            return page(res, 'loginCustomer.ejs', { title: 'Đăng nhập', error: 'Sai tài khoản hoặc mật khẩu.' });
        }
        if (data[0].TrangThai == 0) {
            return page(res, 'loginCustomer.ejs', { title: 'Đăng nhập', error: 'Tài khoản đã bị khóa. Vui lòng liên hệ cửa hàng.' });
        }
        res.cookie('dataLogin', { ID: data[0].ID, TenTK: data[0].TenTK }, {
            httpOnly: true,
            signed: true,
            sameSite: 'lax'
        });
        res.redirect('/customer/home');
    }, req.body.taiKhoan, req.body.password);
}

let logout = (req, res) => {
    res.clearCookie('dataLogin');
    res.redirect('/customer/home');
}

let viewSignup = (req, res) => {
    res.clearCookie('dataLogin');
    page(res, 'signUpCustomer.ejs', { title: 'Đăng ký' });
}

let postSignup = (req, res) => {
    const { usename, password, password_repeat, checkboxx } = req.body;
    const fail = (error) => page(res, 'signUpCustomer.ejs', { title: 'Đăng ký', error, usename });
    if (!usename || !usename.trim()) return fail('Vui lòng nhập tên tài khoản.');
    if (!password || password.length < 6) return fail('Mật khẩu cần ít nhất 6 ký tự.');
    if (password !== password_repeat) return fail('Mật khẩu nhập lại không khớp.');
    if (checkboxx !== 'yes') return fail('Bạn cần đồng ý với điều khoản sử dụng.');
    loginDB.postSignUp(function(data){
        if (!data) return fail('Tên tài khoản đã tồn tại.');
        res.redirect('/customer/login');
    }, usename.trim(), password);
}

let changePass = (req, res) => {
    page(res, 'changePass.ejs', { title: 'Đổi mật khẩu' });
}

let postChangePass = (req, res) => {
    const fail = (error) => page(res, 'changePass.ejs', { title: 'Đổi mật khẩu', error });
    const { password, password_repeat, password_old } = req.body;
    if (!password || password.length < 6) return fail('Mật khẩu mới cần ít nhất 6 ký tự.');
    if (password !== password_repeat) return fail('Mật khẩu nhập lại không khớp.');
    loginDB.isPass((data) => {
        if (!data[0]) return fail('Mật khẩu hiện tại không đúng.');
        loginDB.postChangePass(() => {
            res.clearCookie('dataLogin');
            res.redirect('/customer/login');
        }, password, req.signedCookies.dataLogin);
    }, req.signedCookies.dataLogin, password_old);
}

module.exports = { logout, viewLogin, postLogin, viewSignup, postSignup, changePass, postChangePass };
