var express = require('express');
var router = express.Router();
var mysql= require('mysql');
var uuid=require('uuid/v1');
var N=require('../Neighborhood');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  port: '3306',
  password : 'Athieu98a1k26',
  database : 'recommender_system'
}); 

//thông tin sản phẩm
function get_info_data(id,ketqua)
{
  connection.query('select thuonghieu.ten_thuong_hieu,sanpham.id_sanpham,sanpham.ten_san_pham,sanpham.mota,sanpham.hinhanh,sanpham.gia,sanpham.giamoi,sanpham.soluong,sanpham.gioi_thieu,sanpham.rating_tbsp from sanpham inner join thuonghieu on sanpham.id_thuonghieu=thuonghieu.id where id_sanpham=?', [id], function (error, thongtinsanpham, fields) {
    if (error) throw error;
    else
    {
      connection.query('select id_sanpham,ten_san_pham,hinhanh,gia,giamoi,rating_tbsp from sanpham where id_danhmuc=(select id_danhmuc from sanpham where id_sanpham=?) and id_sanpham not in(?) order by rand() limit 10',[id,id],function(error1,list_sanphamgoi_y_theo_noidung,fields)
      {
        if(error1) throw error1;
        else
        {
          return ketqua(thongtinsanpham,list_sanphamgoi_y_theo_noidung);
        }
      })
    }
  });
}

function layhanhvitangluotxem(userid,id_sanpham)
{
  connection.query('select count(*) from hanhvi where userid=? and id_sanpham=?',[userid,id_sanpham],function(error,count,fields){
    if(error) throw error;
    else
    {
      if(count[0]['count(*)']==0)
      {
        //insert
        connection.query('INSERT INTO `recommender_system`.`hanhvi`(`userid`,`id_sanpham`,`luotxemsanpham`)VALUES(?,?,1)',[userid,id_sanpham],function(error2,result,fields)
        {
          if(error2) throw error2;
        })
      }
      else
      {
        //update
        connection.query('update hanhvi set luotxemsanpham=luotxemsanpham+1 where userid=? and id_sanpham=?',[userid,id_sanpham],function(error3,resull,fields)
        {
          if(error3) throw error3;
        })
      }
    }
  })
}

function tangluotxem(req,res,next)
{
  var ajax=req.query.ajax;
  if(ajax==undefined)
  {
    var id=req.query.id;
    var userid=req.cookies.userID;
    connection.query('update sanpham set luotxem=luotxem+1 where id_sanpham=?',[id],function(error,result,fields)
    {
      if(error) throw error;
    });

    if(userid!=undefined)
    {
      layhanhvitangluotxem(userid,id);
    }
    else
    {
      var session_cart_user=req.cookies.session_cart_id;
      //trường hợp gửi ajax mà ko request
      if(session_cart_user==undefined)
      {
        let uid=uuid();
        res.cookie('session_cart_id',uid);
        session_cart_user=uid;

      }
      layhanhvitangluotxem(session_cart_user,id);
    }
  }
  
  next();
}

function taotruyvanselect(list_suggestions)
{
  var truyvan='select id_sanpham,ten_san_pham,hinhanh,gia,giamoi from sanpham where ';
  for(let i=0;i<list_suggestions.length;i++)
  {
    if(i==list_suggestions.length-1)
    {
      truyvan+="id_sanpham="+list_suggestions[i].ID+" order by rand();";
    }
    else
    {
      truyvan+="id_sanpham="+list_suggestions[i].ID+" or ";
    }
  }
  return truyvan;
}
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
      if(count[0]['count(*)']<5)
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
function loadAllData(userid,ketqua)
{
  get_count_hanhvi(userid,function(cohanhvi)
      {
        if(cohanhvi)
        {
          console.log(cohanhvi)
          //nếu có hành vi thì đào tạo 
          N.Neighborhood(userid,3,10,function(list_suggestions)
          {
            select_sanpham_dudoan(list_suggestions,function(list_data_sanpham){
              return ketqua(list_data_sanpham);
            })
           
          })
        }
        else
        {
          //nếu ko có hành vi thì lấy ngẫu nhiên 1 user nào đó rồi đào tạo
          get_rand_user(function(user)
          {
            var username=user[0].userid;
            N.Neighborhood(username,2,10,function(list_suggestions)
            {
              select_sanpham_dudoan(list_suggestions,function(list_data_sanpham){
                return ketqua(list_data_sanpham);
              })
            })
          })
        }
      })
}


/* GET users listing. */
router.get('/',tangluotxem, function(req, res, next) {
  var id=req.query.id;
  var ajax=req.query.ajax;
  var count_item=req.query.count_item;
  var cothedanhgia=true;
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
    cothedanhgia=false;
  }
  if(ajax==undefined)
  {
    get_info_data(id,function(thongtinsanpham,list_sanphamgoi_y_theo_noidung){
      connection.query("select user_rs.hovaten,danhgiasanpham.tieude,danhgiasanpham.noidung,DATE_FORMAT(thoigian,'%d-%m-%Y') as ngaythang,danhgiasanpham.rating from danhgiasanpham inner join user_rs on danhgiasanpham.id_user=user_rs.id where danhgiasanpham.id_sanpham=? order by thoigian",[id],function(error,noidungdanhgia,fields)
      {
        if(userid!=undefined)
        {
          connection.query('select count(*) from danhgiasanpham where id_user=? and id_sanpham=?',[userid,id],function(error5,count_dg,fields)
          {
            loadAllData(userid,function(list_data_sanpham)
            {
              res.render('single-product',{info_data:thongtinsanpham,list_goi_y_theo_noi_dung:list_sanphamgoi_y_theo_noidung,cothedanhgia:cothedanhgia,noidungdanhgia:noidungdanhgia,count_dg:count_dg,list_data_sanpham:list_data_sanpham});
            })
            
          })
        }
        else
        {
          loadAllData(session_cart_user,function(list_data_sanpham)
          {
          res.render('single-product',{info_data:thongtinsanpham,list_goi_y_theo_noi_dung:list_sanphamgoi_y_theo_noidung,cothedanhgia:cothedanhgia,noidungdanhgia:noidungdanhgia,count_dg:[{'count(*)':0}],list_data_sanpham:list_data_sanpham});
          })
        }

      })

    });
  }
  else
  {
    if(userid==undefined)
    { 
          //kiểm tra xem số lượng sản phẩm có còn để người dùng mua hay ko
      laysoluong(id,function(result)
      {
        var soluong=result[0].soluong;
        count_item=parseInt(count_item);
        capnhatthongtinmuahang(id,count_item,soluong,session_cart_user,function(cothemua)
        {
          var html='';
          if(cothemua)
          {
            html='<div class="alert alert-success">Đã thêm sản phẩm vào giỏ hàng</div>';
          }
          else
          {
            html='<div class="alert alert-danger">Sản phẩm vừa thêm không đủ tồn kho, hiện chỉ mua được tối đa '+soluong+' sản phẩm.</div>';
          }
          connection.query('select count(*),sum(soluongmua) from cart_user_not_login where session_cart_id=?',[session_cart_user],function(error4,count,fields)
          {
            if(error4) throw error4;
            else
            {
              res.send({html:html,soluongdamua:count[0]['sum(soluongmua)'],soluongsanphammua:count[0]['count(*)']});
            }
          });

        });
      });
    }
    else
    {
          //kiểm tra xem số lượng sản phẩm có còn để người dùng mua hay ko
          laysoluong(id,function(result)
          {
            var soluong=result[0].soluong;
            count_item=parseInt(count_item);
            capnhatthongtinmuahanguser(id,count_item,soluong,userid,function(cothemua)
            {
              var html='';
              if(cothemua)
              {
                html='<div class="alert alert-success">Đã thêm sản phẩm vào giỏ hàng</div>'
              }
              else
              {
                html='<div class="alert alert-danger">Sản phẩm vừa thêm không đủ tồn kho, hiện chỉ mua được tối đa '+soluong+' sản phẩm.</div>';
              }
              connection.query('select count(*),sum(soluongmua) from giohang_user where id_user=?',[userid],function(error4,count,fields)
              {
                if(error4) throw error4;
                else
                {
                  res.send({html:html,soluongdamua:count[0]['sum(soluongmua)'],soluongsanphammua:count[0]['count(*)']});
                }
              });
    
            });
          });
    }

  }
});


router.get('/review',function(req,res,next)
{
  var userid=req.cookies.userID;
  var id_sanpham=req.query.idsp;
  var tieude=req.query.tieude;
  var noidung=req.query.noidung;
  var rating=req.query.rating;
  var ratinghanhvi;
  if(rating>2)
  {
    ratinghanhvi=1;
  }
  else
  {
    ratinghanhvi=-1;
  }
  connection.query('INSERT INTO `recommender_system`.`danhgiasanpham`(`id_sanpham`,`id_user`,`tieude`,`noidung`,`rating`)VALUES(?,?,?,?,?)',[id_sanpham,userid,tieude,noidung,rating],function(error,result,fields)
  {

    if(error) throw error;
    else
    {
      //cập nhật hành vi rating
      connection.query('update hanhvi set rating=? where userid=? and id_sanpham=?',[ratinghanhvi,userid,id_sanpham],function(error7,result,fields){if(error7) throw error7});

      connection.query('update sanpham set rating_tbsp=(select truncate(avg(rating),2) from danhgiasanpham where id_sanpham=?) where sanpham.id_sanpham=?',[id_sanpham,id_sanpham],function(eror,result,fields)
      {
        if(eror) throw eror;
        else
        {
          connection.query("select user_rs.hovaten,danhgiasanpham.tieude,danhgiasanpham.noidung,DATE_FORMAT(thoigian,'%d-%m-%Y') as ngaythang,danhgiasanpham.rating from danhgiasanpham inner join user_rs on danhgiasanpham.id_user=user_rs.id where user_rs.id=? and id_sanpham=?",[userid,id_sanpham],function(error2,noidungdanhgia,fields)
          {
            if(error2) throw error2;
            else
            {
              res.render('./html_ajax/noidungdanhgia',{noidungdanhgia:noidungdanhgia});
            }
          })
        }
      })

    }
  })
})



function laysoluong(id,ketqua)
{
  connection.query('select soluong from sanpham where id_sanpham=?',[id],function(error,result,fields)
  {
    if(error) throw error;
    else
    {
      ketqua(result);
    }
  });
}

function capnhatthongtinmuahang(id,soluong_mua,soluongmax,user_id,ketqua)
{
  var soluong_themvao_database=0;
  var cothemua=true;
  connection.query('select count(*),soluongmua from cart_user_not_login where id_sanpham=? and session_cart_id=?',[id,user_id],function(error,count_row,fields)
  {
    if(error) throw error;
    else
    {
      if(count_row[0]['count(*)']>0)
      {
        //nếu chứa sản phẩm rồi thì thêm số lượng
        if(count_row[0].soluongmua+soluong_mua>soluongmax)
        {
          soluong_themvao_database=soluongmax;
          cothemua=false;
        }
        else
        {
          soluong_themvao_database=count_row[0].soluongmua+soluong_mua;
          cothemua=true;
        }
        connection.query('update cart_user_not_login set soluongmua=? where id_sanpham=? and session_cart_id=?',[soluong_themvao_database,id,user_id],function(error3,resull,fields)
        {
          if(error3) throw error3;
          else
          {
            return ketqua(cothemua);
          }
        });
      }
      else
      {
        if(soluong_mua>soluongmax)
        {
          cothemua=false;
          soluong_themvao_database=soluongmax;
        }
        else
        {
          soluong_themvao_database=soluong_mua;
          cothemua=true;
        }
        //nếu chưa chứa sản phẩm thì thêm sản phẩm vào database
        connection.query('INSERT INTO cart_user_not_login(`session_cart_id`,`id_sanpham`,`soluongmua`)VALUES(?,?,?)',[user_id,id,soluong_themvao_database],function(error1,result,fields)
        {
          if(error1) throw error1;
          else
          {
            return ketqua(cothemua);
          }
        })

      }
      connection.query('update hanhvi set luotmuasanpham=? where userid=? and id_sanpham=?',[soluong_themvao_database,user_id,id],function(error8,resull,fields){if(error8) throw error8});
    }
  });
}

function capnhatthongtinmuahanguser(id,soluong_mua,soluongmax,user_id,ketqua)
{
  var soluong_themvao_database=0;
  var cothemua=true;
  connection.query('select count(*),soluongmua from giohang_user where id_sanpham=? and id_user=?',[id,user_id],function(error,count_row,fields)
  {
    if(error) throw error;
    else
    {
      if(count_row[0]['count(*)']>0)
      {
        //nếu chứa sản phẩm rồi thì thêm số lượng
        if(count_row[0].soluongmua+soluong_mua>soluongmax)
        {
          soluong_themvao_database=soluongmax;
          cothemua=false;
        }
        else
        {
          soluong_themvao_database=count_row[0].soluongmua+soluong_mua;
          cothemua=true;
        }
        connection.query('update giohang_user set soluongmua=? where id_sanpham=? and id_user=?',[soluong_themvao_database,id,user_id],function(error3,resull,fields)
        {
          if(error3) throw error3;
          else
          {
            return ketqua(cothemua);
          }
        });
      }
      else
      {
        if(soluong_mua>soluongmax)
        {
          cothemua=false;
          soluong_themvao_database=soluongmax;
        }
        else
        {
          soluong_themvao_database=soluong_mua;
          cothemua=true;
        }
        //nếu chưa chứa sản phẩm thì thêm sản phẩm vào database
        connection.query('INSERT INTO giohang_user(`id_user`,`id_sanpham`,`soluongmua`)VALUES(?,?,?)',[user_id,id,soluong_themvao_database],function(error1,result,fields)
        {
          if(error1) throw error1;
          else
          {
            return ketqua(cothemua);
          }
        })

      }
      connection.query('update hanhvi set luotmuasanpham=? where userid=? and id_sanpham=?',[soluong_themvao_database,user_id,id],function(error8,resull,fields){if(error8) throw error8});
    }
  });
}

module.exports = router;
