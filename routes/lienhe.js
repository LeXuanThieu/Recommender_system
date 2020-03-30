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

function getinfoct(ketqua)
{
  connection.query('select Ten_shop,Dia_chi,So_dien_thoai,email from info_shop',function(error,result,fields)
  {
    if(error) throw error;
    else
    {
      return ketqua(result);
    }
  })
}

router.get('/',function(req,res,next)
{
  getinfoct(function(data)
  {
    res.render('lienhe',{data:data});
  })
})

module.exports=router;