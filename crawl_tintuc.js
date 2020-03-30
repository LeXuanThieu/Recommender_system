const request = require('request');
const cheerio = require('cheerio')
var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    port: '3306',
    password : 'Athieu98a1k26',
    database : 'recommender_system'
  });

  function crawl_data(link_tt,ketqua)
  {
      var list_tieu_de=[];
      var list_gioi_thieu=[];
      var list_hinh_anh=[];
      var list_thoi_gian=[];
      var list_link_noidung=[];
      var sobaicrawl=10;
      request('https://vietnamnet.vn/vn/'+link_tt+"/",function(error,response,body)
      {
          if(error) throw error;
          else
          {
              var $=cheerio.load(body);
  
              var list_tin_tuc=$('.list-content').children('.item').slice(0,sobaicrawl);
  
              list_tin_tuc.map(function(i,el){
              list_tieu_de.push($(this).find('div').find('h3').children('a').text());
              list_thoi_gian.push($(this).find('div').find('div').find('.time').text());
              list_hinh_anh.push($(this).find('a').find('img').attr('src'));
              list_gioi_thieu.push($(this).find('div').find('.lead').text());
              list_link_noidung.push($(this).children('a').attr('href'));
              })
              return ketqua(list_tieu_de,list_gioi_thieu,list_hinh_anh,list_thoi_gian,sobaicrawl,list_link_noidung);
          }
      })
  }
  
  function getnoidung(list_link_noidung,vitri,list_noi_dung,sobaicrawl,ketqua)
  {
  
      request('https://vietnamnet.vn'+list_link_noidung[vitri],function(error1,response,body1)
      {
          if(error1) throw error1;
          $=cheerio.load(body1);
          $('#ArticleContent').find('.article-relate').remove();
          $('#ArticleContent').find('.inner-article').remove();
          $('#ArticleContent').find('p').find('a').remove();
          $('#ArticleContent').find('p').find('iframe').remove();
          $('#ArticleContent').find('.ArticleLead').find('h2').find('p').find('img').remove();
          $('#ArticleContent').find('.ArticleLead').find('h2').find('p').find('span').find('img').remove();
          $('#ArticleContent').find('img').addClass('resizeimg');
          var content=$('#ArticleContent').html();
          list_noi_dung.push(content);
          if(list_noi_dung.length===sobaicrawl)
          {
              return ketqua(list_noi_dung);
          }
          else if(list_noi_dung[vitri]!=undefined)
          {
              vitri++;
              getnoidung(list_link_noidung,vitri,list_noi_dung,sobaicrawl,ketqua);
          }
      })
  }
  
  
  
  function inser_on_update_tintuc(link_tt,id_danhmuc)
  {
  
      crawl_data(link_tt,function(list_tieu_de,list_gioi_thieu,list_hinh_anh,list_thoi_gian,sobaicrawl,list_link_noidung)
      {   
          var list_nd=[];
          getnoidung(list_link_noidung,0,list_nd,10,function(list_noi_dung)
          {
            var truyvan='INSERT INTO `recommender_system`.`tintuc`(`id`,`tieude`,`gioithieu`,`hinhanh`,`noidung`,`thoigian`,`id_danhmuctintuc`)VALUES ';
          for(let i=0;i<sobaicrawl;i++)
          {
              var id=id_danhmuc*10-9+i;
              if(i===sobaicrawl-1)
              {
                  truyvan +="("+connection.escape(id)+","+connection.escape(list_tieu_de[i])+","+connection.escape(list_gioi_thieu[i])+","+connection.escape(list_hinh_anh[i])+","+connection.escape(list_noi_dung[i])+","+connection.escape(list_thoi_gian[i])+","+connection.escape(id_danhmuc)+")";
                  truyvan+='ON DUPLICATE KEY UPDATE `id`=VALUES(`id`),`tieude`=VALUES(`tieude`),`gioithieu`=VALUES(`gioithieu`),`hinhanh`=VALUES(`hinhanh`),`noidung`=VALUES(`noidung`),`thoigian`=VALUES(`thoigian`),`id_danhmuctintuc`=VALUES(`id_danhmuctintuc`);';
                  connection.query(truyvan,function(error,result,fields)
                  {
                      if(error) throw error;
                  })
                  
              }
              else
              {
                  truyvan +="("+connection.escape(id)+","+connection.escape(list_tieu_de[i])+","+connection.escape(list_gioi_thieu[i])+","+connection.escape(list_hinh_anh[i])+","+connection.escape(list_noi_dung[i])+","+connection.escape(list_thoi_gian[i])+","+connection.escape(id_danhmuc)+"),";
              }
          }
          })
      })
  }

module.exports.LayTinTuc=inser_on_update_tintuc;