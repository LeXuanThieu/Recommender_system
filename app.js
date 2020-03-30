var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var uuid=require('uuid/v1');
var trangchu = require('./routes/trangchu');
var sanpham=require('./routes/sanpham');
var cart=require('./routes/cart')
var search=require('./routes/search');
var chitietsanpham=require('./routes/chitietsanpham');
var checkcount=require('./routes/checkcount');
var account=require('./routes/account');
var tintuc=require('./routes/tin-tuc');
var lienhe=require('./routes/lienhe');
var data_particals_mysql=require('./model/data_particals_mysql.js');
var mysql= require('mysql');


var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  port: '3306',
  password : 'Athieu98a1k26',
  database : 'recommender_system'
}); 
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/account/register',express.static(path.join(__dirname, 'public')));
app.use('/account/login',express.static(path.join(__dirname, 'public')));
app.use('/account',express.static(path.join(__dirname, 'public')));

//kiểm tra nếu ko có session thì tạo
function Kiemtra_session_cart(req,res,next)
{
  //lấy thông tin cartid từ cookie người dùng,nếu có thì thôi,không có thì tạo và lưu vào database
  if(req.cookies.session_cart_id==undefined)
  {
    var uid=uuid();
    //tạo cookie session_cart_id
    res.cookie("session_cart_id",uid);
  }
  next();
}

function getallinfo(req,res,next)
{
  var session_userID=req.cookies.userID;
  if(session_userID==undefined)
  {
    //user chưa đăng nhập
    var session_cart_user=req.cookies.session_cart_id;
    connection.query('select count(*),sum(soluongmua) from cart_user_not_login where session_cart_id=?',[session_cart_user],function(error,result,fields)
    {
      if(error) throw error;
      else
      {
        app.locals.count_namesp=result;
        app.locals.hoten='';
        next();
      }
    });
  }
  else
  {
    //user đã hoặc đăng nhập
    connection.query('select hovaten from user_rs where id=?',[session_userID],function(error,hoten,fields)
    {
      connection.query('select count(*),sum(soluongmua) from giohang_user where id_user=?',[session_userID],function(error,result,fields)
      {
        if(error) throw error;
        else
        {
          app.locals.count_namesp=result;
          app.locals.hoten=hoten[0].hovaten;
          next();
        }
      });
    });
  }
}

var globalLocals= function (req, res, next) {
  app.locals.info_shop= data_particals_mysql.info_shop;
  app.locals.info_navbar= data_particals_mysql.info_navbar;
  app.locals.danhmuc_sp= data_particals_mysql.Danh_muc_sp;
  next();
}

app.use(Kiemtra_session_cart);
app.use(getallinfo);
app.use(globalLocals);
app.use('/',trangchu);

app.use('/sanpham',sanpham);

app.use('/cart',cart);

app.use('/search',search);

app.use('/chitietsanpham',chitietsanpham);

app.use('/checkcount',checkcount);
app.use('/account',account);
app.use('/lienhe',lienhe);
app.use('/tin-tuc',tintuc);

app.all('*',function(req,res,next)
{
  res.render('notfound');
})




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
