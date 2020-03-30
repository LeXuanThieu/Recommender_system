var mysql= require('mysql');


var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  port: '3306',
  password : 'Athieu98a1k26',
  database : 'recommender_system'
});


//câu lệnh lấy thông tin cửa hàng
connection.query('select Ten_shop,Dia_chi, So_dien_thoai,email from info_shop', function (error, results, fields) {
    if (error) throw error;
    else
    {
        module.exports.info_shop=results[0];
    }
  });

//câu lệnh lấy thông tin menu navbar
connection.query('select Name_navbar,link_url,vitri from menu_navbar', function (error, results, fields) {
    if (error) throw error;
    else
    {
        module.exports.info_navbar=results;
    }
  });

//câu lệnh lấy danh mục sản phẩm 
connection.query('select id,Ten_tieu_de from danh_muc_san_pham', function (error, results, fields) {
    if (error) throw error;
    else
    {
        module.exports.Danh_muc_sp=results;
    }
  });


  //nếu đăng nhập vào tài khoản thì select số lượng tài khoản
  //nếu không thì select thông tin từ session