var express = require('express');
var router = express.Router();
var mysql= require('mysql');
var uuid=require('uuid/v1');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  port: '3306',
  password : 'Athieu98a1k26',
  database : 'recommender_system'
}); 

function kiemtra_soluongsanpham(session_user_id_cart,ketqua)
{
  connection.query('call capnhapsoluong_notlogin_cart(?)',[session_user_id_cart],function(error,result,fields)
  {
    if(error) throw error;
    else
    {
      connection.query('select sanpham.ten_san_pham,sanpham.hinhanh,sanpham.gia,sanpham.giamoi,cart_user_not_login.soluongmua,cart_user_not_login.id from cart_user_not_login inner join sanpham on cart_user_not_login.id_sanpham=sanpham.id_sanpham where session_cart_id=?',[session_user_id_cart],function(error1,info_data,fields)
      {
        if(error1) throw error1;
        else
        {
          return ketqua(info_data);
        }
      });
    }
  })

}

function kiemtrasoluongsanpham_login(userid,ketqua)
{
  connection.query('call capnhapsoluong_login_cart(?)',[userid],function(error,result,fields)
  {
    if(error) throw error;
    else
    {
      connection.query('select sanpham.ten_san_pham,sanpham.hinhanh,sanpham.gia,sanpham.giamoi,giohang_user.id,giohang_user.soluongmua from sanpham inner join giohang_user on sanpham.id_sanpham=giohang_user.id_sanpham where giohang_user.id_user=?',[userid],function(error1,info_data,fields)
      {
        if(error1) throw error1;
        else
        {
          return ketqua(info_data);
        }
      });
    }
  })
}


/* GET home page. */
router.get('/',function(req, res, next) {
  var idgiohang=req.query.idgiohang;
  var ajax=req.query.ajax;
  var userid=req.cookies.userID;
  if(userid==undefined)
  {
    var session_cart_user=req.cookies.session_cart_id;
        //trường hợp gửi ajax mà ko request
        if(session_cart_user==undefined)
        {
          let uid=uuid();
          res.cookie('session_cart_id',uid);
          session_cart_user=uid;
        }
  }
  else
  {
    session_cart_user=userid;
  }

  if(ajax==undefined)
  {
    if(userid==undefined)
    {
      kiemtra_soluongsanpham(session_cart_user,function(info_data)
      {
        res.render('cart',{data_info:info_data});
      })
    }
    else
    {
      kiemtrasoluongsanpham_login(userid,function(info_data)
      {
        res.render('cart',{data_info:info_data});
      })
    }
  }
  else
  {
    if(userid==undefined)
    {
      remove_idgiohang(idgiohang,function(result)
      {
        kiemtra_soluongsanpham(session_cart_user,function(info_data)
        {
          res.render('./html_ajax/data_cart',{data_info:info_data});
        })
      })
    }
    else
    {
      remove_idgiohang_login(idgiohang,function(result)
      {
        kiemtrasoluongsanpham_login(userid,function(info_data)
        {
          res.render('./html_ajax/data_cart',{data_info:info_data});
        })
      })
    }
  }

});

  function remove_idgiohang(id,ketqua)
  {
    connection.query('delete from cart_user_not_login where id=?',[id],function(error,result,fields)
    {
      if(error) throw error;
      else
      {
        return ketqua(result);
      }
    })
  }

  function remove_idgiohang_login(id,ketqua)
  {
    connection.query('delete from giohang_user where id=?',[id],function(error,result,fields)
    {
      if(error) throw error;
      else
      {
        return ketqua(result);
      }
    })
  }

module.exports = router;
