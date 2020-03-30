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


/* GET home page. */
router.get('/',function(req, res, next) {
   var id=req.query.id;
   var ajax=req.query.ajax;
   if(ajax==undefined)
   {
      if(id==undefined)
      {
         //chỉ truy cập vào tin tức
         getlistdata(function(list_tintuc,danhmuc)
         {
            res.render('tin-tuc',{list_tintuc:list_tintuc,danhmuc:danhmuc});
         })
      }
      else
      {
         getnoidung(id,function(noidung)
         {
            res.render('conten_tintuc',{noidung:noidung});
         })
      }
   }
   else
   {
      var id_danhmuc=req.query.id_danhmuc;
      getdataajax(id_danhmuc,function(list_tintuc)
      {
         res.render('./html_ajax/ajax_tintuc',{list_tintuc:list_tintuc});
      })
   }
});

function getdataajax(id_danhmuc,ketqua)
{
   connection.query('select id,tieude,gioithieu,hinhanh,thoigian from tintuc where id_danhmuctintuc=?',[id_danhmuc],function(error,list_tintuc,fields)
   {
      if(error) throw error;
      else
      {
         return ketqua(list_tintuc);
      }
   })
}

function getlistdata(ketqua)
{
   connection.query('select id,tieude,gioithieu,hinhanh,thoigian from tintuc where id_danhmuctintuc=1',function(error,list_tintuc,fields)
   {
      if(error) throw error;
      else
      {
         connection.query('select * from danhmuctintuc',function(error1,danhmuc,fields)
         {
            if(error1) throw error1;
            else
            {
               return ketqua(list_tintuc,danhmuc);
            }
         })
      }
   })
}

function getnoidung(id,ketqua)
{
   connection.query('select noidung from tintuc where id=?',[id],function(error,noidung,fields)
   {
      if(error) throw error;
      else
      {
         return ketqua(noidung);
      }
   })
}


module.exports = router;
