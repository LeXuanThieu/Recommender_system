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

function laythongtintaikhoan(userid,ketqua)
{
    connection.query('select hovaten,sodienthoai,email from user_rs where id=?',[userid],function(error,listdata,fields)
    {
        if(error) throw error;
        else
        {
            ketqua(listdata);
        }
    }); 
}

function laythongtinhoadon(userid,ketqua)
{
    connection.query('select mahoadon,DATE_FORMAT(ngaytao,"%d-%m-%Y") as ngaythang,tongtien,tinhtrangthanhtoan,diachi from hoadon where userid=?',[userid],function(error,list_hoadon,fields){
        if(error) throw error;
        else
        {
            return ketqua(list_hoadon);
        }
    })
}

/* GET home page. */
router.get('/',function(req, res, next) {
    if(req.cookies.userID!=undefined)
    {
        var userid=req.cookies.userID;
        laythongtintaikhoan(userid,function(listdata)
        {
            laythongtinhoadon(userid,function(list_hoadon){
                res.render('account',{listdata:listdata,alert:0,list_hoadon:list_hoadon});
            })

        })

    }
    else
    {
        res.redirect('/')
    }
});

router.post('/',function(req,res,next)
{
    var hovaten=req.body.hovaten;
    var sodienthoai=req.body.sodienthoai;
    var email=req.body.diachiemail;
    var userid=req.cookies.userID;
    updatetaikhoan(hovaten,sodienthoai,userid)
    {

        laythongtintaikhoan(userid,function(listdata)
        {
            res.render('account',{listdata:listdata,alert:1});
        })
    }
})



/* GET home page. */
router.get('/register',function(req, res, next) {
    if(req.cookies.userID==undefined)
    {
        res.render('register',{er:false});
    }
    else
    {
        res.redirect('/');
    }
});



router.post('/register',function(req, res, next) {
    var hoten=req.body.hoten;
    var sodienthoai=req.body.sodienthoai;
    var email=req.body.email;
    var matkhau=req.body.matkhau;

    themtaikhoan(hoten,sodienthoai,email,matkhau,function(dacotaikhoan){
        if(dacotaikhoan)
        {
            res.render('register',{er:true});
        }
        else
        {
            connection.query('select id from user_rs where email=?',[email],function(error3,result,fields)
            {
                if(error3) throw error3;
                else
                {
                    res.cookie('userID',result[0].id);
                    res.redirect('/');
                }
            })
        }
    });
});


router.get('/login',function(req,res,next)
{
    if(req.cookies.userID==undefined)
    {
        res.render('login',{er:false});
    }
    else
    {
        res.redirect('/');
    }
});

router.post('/login',function(req,res,next)
{
    var emaildangnhap=req.body.emaildangnhap;
    var matkhaudangnhap=req.body.matkhaudangnhap;
    kiemtradangnhap(emaildangnhap,matkhaudangnhap,function(dangnhapthanhcong,result)
    {
        if(dangnhapthanhcong)
        {
            res.cookie('userID',result[0].id);
            res.redirect('/');
        }
        else
        {
            res.render('login',{er:true});
        }
    });

});

router.get('/logout',function(req,res,next)
{
    res.clearCookie('userID');
    res.redirect('/');
});

router.post('/editpass',function(req,res,next)
{
    var passwordold=req.body.passwordold;
    var passwordnew=req.body.passwordnew;
    var userid=req.cookies.userID;
    kiemtramatkhau(passwordold,passwordnew,userid,function(matkhaudung)
    {
        if(matkhaudung)
        {
            laythongtintaikhoan(userid,function(listdata)
            {
                res.render('account',{listdata:listdata,alert:1});
            })
        }
        else
        {
            laythongtintaikhoan(userid,function(listdata)
            {
                res.render('account',{listdata:listdata,alert:2});
            })
        }
    })

});

function kiemtramatkhau(passwordold,passwordnew,userid,ketqua)
{
    connection.query('select matkhau from user_rs where id=?',[userid],function(error,result,fields)
    {
        if(error) throw error;
        else
        {
            if(result[0].matkhau==passwordold)
            {
                //nếu mà bằng thì update
                connection.query('update user_rs set matkhau=? where id=?',[passwordnew,userid],function(error2,result,fields)
                {
                    if(error2) throw error2;
                    else
                    {
                        return ketqua(true);
                    }
                })
            }
            else
            {
                //không bằng thì thông báo
                return ketqua(false);
            }
        }
    })
}



function kiemtradangnhap(email_dn,matkhau_dn,ketqua)
{
    connection.query('select count(*),id from user_rs where email=? and matkhau=?',[email_dn,matkhau_dn],function(error,count_tk,fields)
    {
        if(error) throw error;
        else
        {
            if(count_tk[0]['count(*)']>0)
            {
                return ketqua(true,count_tk);
            }
            else
            {
                return ketqua(false,count_tk);
            }
        }
    })
}


function themtaikhoan(ht,sdt,em,mk,ketqua)
{
    connection.query('select count(*) from User_rs where email=?',[em],function(error,count_tk,fields){
        if(error) throw error;
        else
        {
            if(count_tk[0]['count(*)']==0)
            {
                //chưa có thài khoản
                connection.query('INSERT INTO `recommender_system`.`user_rs`(`hovaten`,`sodienthoai`,`email`,`matkhau`)VALUES(?,?,?,?)',[ht,sdt,em,mk],function(error2,result,fields)
                {
                    if(error2) throw error2;
                    else
                    {
                        return ketqua(false);
                    }
                })
            }
            else
            {
                //có thài khoản rồi
                return ketqua(true);
            }
        }
    });
}

function updatetaikhoan(ht,sdt,id)
{
    connection.query('update user_rs set hovaten=?,sodienthoai=? where id=?',[ht,sdt,id],function(error,result,fields)
    {
        if(error) throw error;
    })
}

module.exports = router;
