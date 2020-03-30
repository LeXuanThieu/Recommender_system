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

//tìm kiếm sản phẩm
function search_item(search,offset,ketqua)
{
  connection.query("select id_sanpham,ten_san_pham,hinhanh,gia,giamoi,rating_tbsp from sanpham where ten_san_pham like ? limit 12 offset ?", [search,offset], function (error, all_data_sanpham, fields) {
    if (error) throw error;
    else
    {
        connection.query("select count(*) from sanpham where ten_san_pham like ?",[search],function(error1,count_sanpham,fields)
        {
            if(error1) throw error1;
            else
            {
                connection.query('select distinct thuonghieu.id,thuonghieu.ten_thuong_hieu from sanpham inner join thuonghieu on sanpham.id_thuonghieu=thuonghieu.id where ten_san_pham like ?',[search],function(error2,thuonghieu,fields)
                {
                    if(error2) throw error2;
                    else{
                        return ketqua(all_data_sanpham,count_sanpham,thuonghieu);
                    }
                });
            }
        })
    }
  });
}
function loadlaidata(search,ketqua)
{
  connection.query('select id_sanpham,ten_san_pham,hinhanh,gia,giamoi,rating_tbsp from sanpham where ten_san_pham like ? limit 12',[search],function(error1,list_sanpham,fields)
  {
    if(error1) throw error1;
    else
    {
      connection.query('select count(*) from sanpham where ten_san_pham like ?',[search],function(error2,count_sp,fields)
      {
        return ketqua(list_sanpham,count_sp);
      })
    }
  })
}
var dulieuloc='';
var thamso_ajax=[];
var dulieusapxep='';
var sapxep;
var phantrang;
var search;
var data_thuonghieu;
var data_giatri;
var cautruyvanall_sanpham='select id_sanpham,ten_san_pham,hinhanh,gia,giamoi,rating_tbsp from sanpham where ';
var cautruyvancount='select count(*) from sanpham where ';
var limit12='limit 12';
function cautruyvanloc()
{
  dulieuloc='';
  thamso_ajax=[];

  dulieuloc+='ten_san_pham like ? and ';
  thamso_ajax.push(search);


  //nếu chỉ có giá trị
  if(data_giatri===undefined && data_thuonghieu.length>0)
  {
      //nếu chỉ chứa thương hiệu,không chứa giá trị
      for(let i=0;i<data_thuonghieu.length;i++)
      {
        if(i==data_thuonghieu.length-1)
        {
          dulieuloc+='id_thuonghieu=? ';
        }
        else
        {
          dulieuloc+='id_thuonghieu=? or ';
        }
        data_thuonghieu[i]=parseInt(data_thuonghieu[i]);
        thamso_ajax.push(data_thuonghieu[i]);
      }
      return;
  }
  if(data_giatri.length>0 && data_thuonghieu===undefined)
  {
    if(data_giatri[0]=='min')
    {
      dulieuloc+='gia<? ';
      thamso_ajax.push(data_giatri[1]);
    }
    else if(data_giatri[1]=='max')
    {
      dulieuloc+='gia>? ';
      thamso_ajax.push(data_giatri[0]);
    }
    else
    {
      dulieuloc+='gia between ? and ? ';
      thamso_ajax.push(data_giatri[0]);
      thamso_ajax.push(data_giatri[1]);
    }
    return;
  }
    //có cả giá trị và thuong hiệu
  if(data_giatri.length>0 && data_thuonghieu.length>0)
  {
      //có cả giá trị và thương hiệu
    if(data_giatri[0]=='min')
    {
      for(let i=0;i<data_thuonghieu.length;i++)
      {
        if(i==data_thuonghieu.length-1)
        {
          dulieuloc+='id_thuonghieu=? and gia<? '
        }
        else
        {
          dulieuloc+='id_thuonghieu=? and gia<? or '
        }
        thamso_ajax.push(data_thuonghieu[i]);
        thamso_ajax.push(data_giatri[1]);
      }
    }
    else if(data_giatri[1]=='max')
      {
        for(let i=0;i<data_thuonghieu.length;i++)
        {
          if(i==data_thuonghieu.length-1)
          {
            dulieuloc+='id_thuonghieu=? and gia>? '
          }
          else
          {
            dulieuloc+='id_thuonghieu=? and gia>? or '
          }
          thamso_ajax.push(data_thuonghieu[i]);
          thamso_ajax.push(data_giatri[0]);
        }
    }
    else
      {
        for(let i=0;i<data_thuonghieu.length;i++)
        {
          if(i==data_thuonghieu.length-1)
          {
            dulieuloc+='id_thuonghieu=? and gia between ? and ? ';
          }
          else
          {
            dulieuloc+='id_thuonghieu=? and gia between ? and ? or ';
          }
          thamso_ajax.push(data_thuonghieu[i]);
          thamso_ajax.push(data_giatri[0]);
          thamso_ajax.push(data_giatri[1]);
        }
    }
    return;
  }

}

/* GET users listing. */
router.get('/', function(req, res, next) {
    search=req.query.search;
    var ajax=req.query.ajax;
    data_thuonghieu=req.query.data_thuonghieu;
    data_giatri=req.query.data_giatri;
    sapxep=req.query.order;
    phantrang=req.query.phantrang;

    if(search=='')
    {
        res.render('sanpham',{validate_data:false,dieuhuong:'Tk'});
    }
    else
    {
        search='%'+search+'%';
        if(ajax==undefined)
        {
            dulieuloc='';
            thamso_ajax=[];
            dulieusapxep='';
            search_item(search,0,function(all_data_sanpham,count_sanpham,thuonghieu){
                res.render('sanpham',{validate_data:true,dieuhuong:'Tk',data_sanpham:all_data_sanpham,count_sp:count_sanpham,ds_thuonghieu:thuonghieu});
            });
        }
        else
        {
            if(data_thuonghieu==undefined&&data_giatri==undefined&&sapxep==undefined&&phantrang==undefined)
            {
                dulieuloc='';
                thamso_ajax=[];
                dulieusapxep='';
                loadlaidata(id,function(list_sanpham,count_sp)
                { 
                    res.render('./html_ajax/data_sanpham_ajax',{data_sanpham:list_sanpham,count_sp:count_sp})
                })

            }
            else if(data_thuonghieu!=undefined||data_giatri!=undefined&&sapxep==undefined&&phantrang==undefined)
            {

                //chỉ lọc giá trị,xóa toàn bộ dữ liệu sắp xếp và phân trang reset về ban đầu
                dulieusapxep='';
                cautruyvanloc();
                truyvanajax(dulieuloc,dulieusapxep,'',thamso_ajax,function(list_sanpham,count_sp)
                {
                res.render('./html_ajax/data_sanpham_ajax',{data_sanpham:list_sanpham,count_sp:count_sp})
                });
                
            }
            else if(sapxep!=undefined)
            {
              var kt=sapxep.split('-');
              if(kt[0]==='t')
              {
                dulieusapxep='order by ten_san_pham '+kt[1];
              }
              else if(kt[0]==='g')
              {
                dulieusapxep='order by gia '+kt[1];
              }
            if(dulieuloc!='')
            {
                //sắp sếp theo giá trị lọc;
                truyvanajax(dulieuloc,dulieusapxep,'',thamso_ajax,function(list_sanpham,count_sp)
                {
                res.render('./html_ajax/data_sanpham_ajax',{data_sanpham:list_sanpham,count_sp:count_sp})
                });
            }
            else
            {
                //nếu ko chứa thì thì sắp xếp theo truy vấn
                truyvankocoajax(dulieusapxep,'',function(list_sanpham,count_sp)
                {
                res.render('./html_ajax/data_sanpham_ajax',{data_sanpham:list_sanpham,count_sp:count_sp})
                });
            }

            }
            else if(phantrang!=undefined)
            {
            phantrang=parseInt(phantrang);
            phantrang=phantrang*12-12;
            phantrang='offset '+phantrang;
            if(dulieuloc!='')
            {
                //phân trang theo ajax
                phantrangloc(dulieuloc,dulieusapxep,phantrang,thamso_ajax,function(list_sanpham)
                {
                res.render('./html_ajax/phantrang_ajax',{data_sanpham:list_sanpham})
                });
            }
            else
            {
                phantrangtruyvan(dulieusapxep,phantrang,function(list_sanpham)
                {
                
                res.render('./html_ajax/phantrang_ajax',{data_sanpham:list_sanpham})
                })
            }

            }
        }

     }
});


function truyvanajax(dl,sx,pt,th,ketqua)
{ 
  connection.query(cautruyvanall_sanpham+''+dl+' '+sx+' '+limit12+' '+pt,th,function(error,all_sanpham,fields)
  {

    if(error) throw error;
    else
    {
      connection.query(cautruyvancount+''+dl+' '+sx+' '+limit12+' '+pt,th,function(error1,count_sp,fields)
      {
        if(error1) throw error1;
        else
        {
          return ketqua(all_sanpham,count_sp);
        }
      })
    }
  });
}

function phantrangloc(dl,sx,pt,th,ketqua)
{
  connection.query(cautruyvanall_sanpham+''+dl+' '+sx+' '+limit12+' '+pt,th,function(error,all_sanpham,fields)
  {
    if(error) throw error;
    else
    {
      return ketqua(all_sanpham);
    }
  })
}

function phantrangtruyvan(sx,pt,ketqua)
{
  
  connection.query('select id_sanpham,ten_san_pham,hinhanh,gia,giamoi from sanpham where ten_san_pham like ? '+sx+' limit 12'+' '+pt,[search],function(error,all_sanpham,fields)
  {
    if(error) throw error;
    else
    {
      return ketqua(all_sanpham);
    }
  })
}

function truyvankocoajax(sx,pt,ketqua)
{
  connection.query('select id_sanpham,ten_san_pham,hinhanh,gia,giamoi from sanpham where ten_san_pham like ? '+sx+' limit 12'+' '+pt,[search],function(error,all_sanpham,fields)
  {
    if(error) throw error;
    else
    {
      connection.query('select count(*) from sanpham where ten_san_pham like '+connection.escape(search)+' '+sx+' limit 12'+' '+pt,function(error1,count_sp,fields)
      {
        if(error1) throw error1;
        else
        {
          return ketqua(all_sanpham,count_sp);
        }
      })
    }
  })
}



module.exports = router;
