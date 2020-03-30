$(document).ready(function(){

    $(".product-related").owlCarousel(
        {
            responsive:
            {
                1200:
                {
                    items:5,
                    loop:true,
                    
                    dots:false,
                },
                768:
                {
                    items:4,
                    loop:true,
                    
                    dots:false,
                },
                576:
                {
                    items:3,
                    loop:true,
                    
                    dots:false,
                },
                0:
                {
                    items:2,
                    loop:true,
                    
                    dots:false,
                }
            }
        }
    );


    $(".see-detail").click(function() {
        $('html, body').animate({
            scrollTop: ($('.block-tab-info').offset().top)
        },500);
    });

    var element_value_count=document.getElementsByClassName('prd_quantity');
    var element_thongbao_check=document.getElementById('thongbao_check');


    $("#btn_check_count").click(function(){
        
        $.get("",{count_item:element_value_count[0].value,ajax:'ajax'}, function(data, status){
            //let info_data=data.split('|');
            element_thongbao_check.innerHTML='';
            element_thongbao_check.innerHTML=data.html;
            hienthisoluongitemtronggiohang(data.soluongdamua,data.soluongsanphammua);
        });
      });
    function hienthisoluongitemtronggiohang(soluongdamua,soluongsanphamdamua)
    {
        var element_count_item=document.getElementById('soluongdamua');
        var element_item_buy=document.getElementById('soluongsanphamdamua');
        element_count_item.innerHTML=soluongdamua;
        element_item_buy.innerHTML=soluongsanphamdamua;
    }

    //hover star
    var element_star=document.getElementsByClassName('star');
    var numberhover;
    for(let i=0;i<element_star.length;i++)
    {
        element_star[i].onmouseover =function(el)
        {
            numberhover=parseInt(el.target.dataset.alt);
            hienthisao(numberhover);
        }
    }

    function hienthisao(numberhover)
    {
        for(let i=0;i<numberhover;i++)
        {
            //thêm class sao đầy
            element_star[i].classList.remove('fa-star-o');
            element_star[i].classList.add('fa-star');
        }
        for(let i=numberhover;i<5;i++)
        {
            //xóa class sao đầy
            element_star[i].classList.remove('fa-star');
            element_star[i].classList.add('fa-star-o');
        }
    }

    var element_tieude=document.getElementById('tieude');
    var element_comment=document.getElementById('comment');
    var element_submit_review=document.getElementById('btn-submit-review');
    var element_product_review=document.getElementsByClassName('product-review');
    var element_product_review_buton=document.getElementsByClassName('product-review-buton');
    var element_product_review_list=document.getElementById('product-reviews-list');
    $("#btn-submit-review").click(function(){
        var tieude=element_tieude.value;
        var noidung=element_comment.value;
        var idsp=element_submit_review.dataset.id_sanpham;
        $.get("/chitietsanpham/review",{tieude:tieude,noidung:noidung,idsp:idsp,rating:numberhover}, function(data, status){
            if(element_product_review.length!=0)
            {
                element_product_review_list.removeChild(element_product_review_buton[0]);
                data=new DOMParser().parseFromString(data,'text/html').body.firstChild;
                element_product_review_list.insertBefore(data,element_product_review[element_product_review.length]);
            }
            else
            {
                element_product_review_list.innerHTML='';
                element_product_review_list.innerHTML=data;
            }
        });
      });


});

