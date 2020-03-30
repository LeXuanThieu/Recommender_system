var express = require('express');
var router = express.Router();
var mysql= require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  port: '3306',
  password : 'Athieu98a1k26',
  database : 'recommender_system'
}); 

function getdatanot_login(sessionid,ketqua)
{
  connection.query('select sum(soluongmua) as tongsoluong from cart_user_not_login where session_cart_id=?',[sessionid],function(error,count,fields)
  {
    if(error) throw error;
    else
    {
      connection.query('select sanpham.ten_san_pham,sanpham.hinhanh,sanpham.gia,sanpham.giamoi,soluongmua from cart_user_not_login inner join sanpham on cart_user_not_login.id_sanpham=sanpham.id_sanpham where session_cart_id=?',[sessionid],function(error1,listdata,fields){
        if(error1) throw error1;
        else
        {
          return ketqua(count,listdata);
        }
      })
    }
  })
}

function getdata_login(userid,ketqua)
{
  connection.query('select sum(soluongmua) as tongsoluong from giohang_user where id_user=?',[userid],function(error,count,fields){
    if(error) throw error;
    else
    {
      connection.query('select sanpham.ten_san_pham,sanpham.hinhanh,sanpham.gia,sanpham.giamoi,soluongmua from giohang_user inner join sanpham on giohang_user.id_sanpham=sanpham.id_sanpham where id_user=?',[userid],function(error1,listdata,fields){
        if(error1) throw error1;
        else
        {
          return ketqua(count,listdata);
        }
      })
    }
  })
}

/* GET home page. */
router.get('/',function(req, res, next) {
  var id=req.cookies.userID;

  if(id==undefined)
  {
    var sessionid_cart=req.cookies.session_cart_id;
    getdatanot_login(sessionid_cart,function(count,listdata){
      res.render('checkcount',{count:count,listdata:listdata});
    })
  }
  else
  {
    getdata_login(id,function(count,listdata){
      res.render('checkcount',{count:count,listdata:listdata});
    })
  }

});


router.post('/',function(req,res,next){
  var id=req.cookies.userID;

  var email=req.body.email;
  var hovaten=req.body.hovaten;
  var sodienthoai=req.body.sodienthoai;
  var diachi=req.body.diachi;
  var tinh=req.body.tinh;
  var huyen=req.body.huyen;
  var ghichu=req.body.ghichu;
  if(id==undefined)
  {
    var sessionid_cart=req.cookies.session_cart_id;
    xulyhoadonnotlogin(sessionid_cart,email,hovaten,sodienthoai,diachi,tinh,huyen,ghichu,function(ketqua){
      res.render('success');
    })
  }
  else
  {
    xulyhoadonlogin(id,email,hovaten,sodienthoai,diachi,tinh,huyen,ghichu,function(ketqua){
      res.render('success');
    })
  }

})




function xulyhoadonnotlogin(sessioncart,em,hvt,sdt,dc,tt,h,gc,ketqua)
{
  connection.query('select sum(case when sanpham.giamoi>0 then sanpham.giamoi else sanpham.gia end*soluongmua) as sum from cart_user_not_login inner join sanpham on cart_user_not_login.id_sanpham=sanpham.id_sanpham where session_cart_id=?',[sessioncart],function(error,tong,fields){
    if(error) throw error;
    else
    {
      connection.query('INSERT INTO `recommender_system`.`hoadon`(`userid`,`email`,`hovaten`,`sodienthoai`,`diachi`,`tinhthanh`,`huyen`,`ghichu`,`tongtien`,`ngaytao`,`tinhtrangthanhtoan`)VALUES(?,?,?,?,?,?,?,?,?,default,default)',[sessioncart,em,hvt,sdt,dc,tt,h,gc,tong[0].sum],function(error1,result,fields)
      {
        if(error1) throw error1;
        else
        {
          connection.query('SELECT mahoadon FROM hoadon WHERE userid = ?',[sessioncart],function(error2,mahoadon,fields)
          {
            connection.query('INSERT INTO `recommender_system`.`chitiethoadon`(`mahoadon`,`id_sanpham`,`soluong`)select ?,id_sanpham,soluongmua from cart_user_not_login where session_cart_id=?',[mahoadon[0].mahoadon,sessioncart],function(error3,result,fields){
              if(error3) throw error3;
              else
              {
                connection.query('delete from cart_user_not_login where session_cart_id=?',[sessioncart],function(error4,result,fields){
                  if(error4) throw error4;
                  else
                  {
                    return ketqua(true);
                  }
                })
              }
            })
          })
        }
      });
    }
  })
}

function xulyhoadonlogin(id,em,hvt,sdt,dc,tt,h,gc,ketqua)
{
  connection.query('select sum(case when sanpham.giamoi>0 then sanpham.giamoi else sanpham.gia end*soluongmua) as sum from giohang_user inner join sanpham on giohang_user.id_sanpham=sanpham.id_sanpham where id_user=?',[id],function(error,tong,fields){
    if(error) throw error;
    else
    {
      connection.query('INSERT INTO `recommender_system`.`hoadon`(`userid`,`email`,`hovaten`,`sodienthoai`,`diachi`,`tinhthanh`,`huyen`,`ghichu`,`tongtien`,`ngaytao`,`tinhtrangthanhtoan`)VALUES(?,?,?,?,?,?,?,?,?,default,default)',[id,em,hvt,sdt,dc,tt,h,gc,tong[0].sum],function(error1,result,fields)
      {
        if(error1) throw error1;
        else
        {
          connection.query('SELECT mahoadon FROM hoadon WHERE userid = ?',[id],function(error2,mahoadon,fields)
          {
            connection.query('INSERT INTO `recommender_system`.`chitiethoadon`(`mahoadon`,`id_sanpham`,`soluong`)select ?,id_sanpham,soluongmua from giohang_user where id_user=?',[mahoadon[0].mahoadon,id],function(error3,result,fields){
              if(error3) throw error3;
              else
              {
                connection.query('delete from giohang_user where id_user=?',[id],function(error4,result,fields){
                  if(error4) throw error4;
                  else
                  {
                    return ketqua(true);
                  }
                })
              }
            })
          })
        }
      });
    }
  })
}

module.exports = router;
