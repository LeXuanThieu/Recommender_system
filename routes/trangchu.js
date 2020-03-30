var express = require('express');
var router = express.Router();
var R=require('../Recommender_system');
var uuid=require('uuid/v1');

var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    port: '3306',
    password : 'Athieu98a1k26',
    database : 'recommender_system'
  });

function get_rand_user(ketqua)
{
  connection.query('select userid from hanhvi order by rand() limit 1',function(error,user,fields)
  {
    if(error) throw error;
    else
    {
      return ketqua(user);
    }
  }) 
}

function get_count_hanhvi(userid,ketqua)
{
  connection.query("select count(*) from hanhvi where userid=?",[userid],function(error,count,fields){
    if(error) throw error;
    else
    {
      if(count[0]['count(*)']==0)
      {
        //chưa có dữ liệu hành vi
        return ketqua(false);
      }
      else
      {
        //có dữ liệu hành vi
        return ketqua(true);
      }
    }
  })
}

function taotruyvanselect(list_suggestions)
{
  var truyvan='select id_sanpham,ten_san_pham,hinhanh,gia,giamoi,rating_tbsp from sanpham where ';
  for(let i=0;i<list_suggestions.length;i++)
  {
    if(i==list_suggestions.length-1)
    {
      truyvan+="id_sanpham="+list_suggestions[i].ID+";";
    }
    else
    {
      truyvan+="id_sanpham="+list_suggestions[i].ID+" or ";
    }
  }
  return truyvan;
}

function select_sanpham_dudoan(list_suggestions,ketqua)
{
  connection.query(taotruyvanselect(list_suggestions),function(error,list_data_sanpham,fields)
  {
    if(error) throw error;
    else
    {
      return ketqua(list_data_sanpham);
    }
  })
}

function select_sanphamxemnhieunhat(ketqua)
{
  connection.query('select id_sanpham,ten_san_pham,hinhanh,gia,giamoi,rating_tbsp from sanpham order by luotxem desc limit 10',function(error,list_view_sanpham,fields)
  {
    if(error) throw error;
    else
    {
      return ketqua(list_view_sanpham);
    }
  })
}

function loadAllData(userid,ketqua)
{
  get_count_hanhvi(userid,function(cohanhvi)
      {
        if(cohanhvi)
        {
          //nếu có hành vi thì đào tạo 
          R.recommender_system(userid,10,function(list_suggestions)
          {
            select_sanpham_dudoan(list_suggestions,function(list_data_sanpham){
              select_sanphamxemnhieunhat(function(list_view_sanpham)
              {
                return ketqua(list_data_sanpham,list_view_sanpham);
              })

            })
           
          })
        }
        else
        {
          //nếu ko có hành vi thì lấy ngẫu nhiên 1 user nào đó rồi đào tạo
          get_rand_user(function(user)
          {
            var username=user[0].userid;
            R.recommender_system(username,10,function(list_suggestions)
            {
              select_sanpham_dudoan(list_suggestions,function(list_data_sanpham){
                select_sanphamxemnhieunhat(function(list_view_sanpham)
                {
                  return ketqua(list_data_sanpham,list_view_sanpham);
                })
              })
            })
          })
        }
      })
}


/* GET home page. */
router.get('/',function(req, res, next) {
  var userid=req.cookies.userID;
  if(userid==undefined)
  {
    //chưa đăng nhập
    var session_cart_user=req.cookies.session_cart_id;
    if(session_cart_user==undefined)
    {
      let uid=uuid();
      res.cookie('session_cart_id',uid);
      session_cart_user=uid;
    }
    loadAllData(session_cart_user,function(list_data_sanpham,list_view_sanpham)
    {
      gettintuc(function(list_tintuc)
      {
        res.render('trangchu',{list_data_sanpham:list_data_sanpham,list_view_sanpham:list_view_sanpham,list_tintuc:list_tintuc});
      })
    })
  }
  else
  {
    loadAllData(userid,function(list_data_sanpham,list_view_sanpham)
    {
      gettintuc(function(list_tintuc)
      {
        res.render('trangchu',{list_data_sanpham:list_data_sanpham,list_view_sanpham:list_view_sanpham,list_tintuc:list_tintuc});
      })
    })
  }

});



module.exports = router;


function gettintuc(ketqua)
{
  connection.query('select id,tieude,gioithieu,hinhanh,thoigian from tintuc where id_danhmuctintuc=1 limit 4;',function(error,list_tt,fields)
  {
    if(error) throw error;
    else
    {
      return ketqua(list_tt);
    }
  })
}