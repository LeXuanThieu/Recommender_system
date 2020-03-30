
var element_btn_thuonghieu=document.getElementsByClassName('btn_thuonghieu');
var element_gray_color=document.getElementsByClassName('gray_color');
var element_check_price=document.getElementsByClassName('custom-control-input');
var element_alert=document.getElementById('alert_info');
var element_order_by=document.getElementsByClassName('sub-menu-inner');
var element_render_html=document.getElementById('render_html');
for(let i=0;i<element_btn_thuonghieu.length;i++)
{
    element_btn_thuonghieu[i].addEventListener('click',function(el)
    {
        el.target.classList.toggle('gray_color');
        element_alert.innerHTML="";

    })
}
for(let i=0;i<element_order_by.length;i++)
{
    element_order_by[i].addEventListener('click',function(el){
        var info=el.target.dataset.order;
        $.get('',{order:info,ajax:'ajax'},function(data)
        {
            element_render_html.innerHTML='';
            element_render_html.innerHTML=data;
            try
            {
                var element_pagination=document.getElementsByClassName('pagination-wrap');
                max_item_g=parseInt(element_pagination[0].dataset.num);
                init();
            }
            catch{}
        });
    });
}

function Xoaboloc()
{
    data_thuonghieu=[];
    data_giatri=[];
    for(let i=0;i<element_btn_thuonghieu.length;i++)
    {
        element_btn_thuonghieu[i].classList.remove('gray_color');
    }
    for(let i=0;i<element_check_price.length;i++)
    {
        element_check_price[i].checked=false;
    }
    element_alert.innerHTML="";

    $.get('',{ajax:'ajax'},function(data)
        {
            console.log(data);
            element_render_html.innerHTML='';
            element_render_html.innerHTML=data;
            try
            {
                var element_pagination=document.getElementsByClassName('pagination-wrap');
                max_item_g=parseInt(element_pagination[0].dataset.num);
                init();
            }
            catch{}
        });
}

var data_thuonghieu=[];
var data_giatri=[];
function Locsanpham()
{
    data_thuonghieu=[];
    data_giatri=[];
    for(let i=0;i<element_check_price.length;i++)
    {
        if(element_check_price[i].checked==true)
        {
            data_giatri.push(element_check_price[i].dataset.min);
            data_giatri.push(element_check_price[i].dataset.max);
            break;
        }
    }
    for(let i=0;i<element_gray_color.length;i++)
    {
        data_thuonghieu.push(element_gray_color[i].dataset.idthuonghieu);
    }
    if(data_thuonghieu.length>0||data_giatri.length>0)
    {
        $.get('',{data_thuonghieu:data_thuonghieu,data_giatri:data_giatri,ajax:'ajax'},function(data)
        {
            element_render_html.innerHTML='';
            element_render_html.innerHTML=data;
            try
            {
                var element_pagination=document.getElementsByClassName('pagination-wrap');
                max_item_g=parseInt(element_pagination[0].dataset.num);
                init();
            }
            catch{}
            

        });
    }
    else
    {
        element_alert.innerHTML='<div class="alert alert-danger">Mời nhập thông tin</div>';
    }
}

// the selector will match all input controls of type :checkbox
// and attach a click event handler 
$("input:checkbox").on('click', function() {
  // in the handler, 'this' refers to the box clicked on
  var $box = $(this);
  if ($box.is(":checked")) {
    // the name of the box is retrieved using the .attr() method
    // as it is assumed and expected to be immutable
    var group = "input:checkbox[name='" + $box.attr("name") + "']";
    // the checked state of the group/box on the other hand will change
    // and the current value is retrieved using .prop() method
    $(group).prop("checked", false);
    $box.prop("checked", true);
    element_alert.innerHTML="";
  } else {
    $box.prop("checked", false);
  }
});