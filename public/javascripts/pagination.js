
    var element_pagination_wrap=document.getElementsByClassName('pagination-wrap');
    var element_active=document.getElementsByClassName('itemactive');
    var range_visibility=5;
    var max_item_g=parseInt(element_pagination_wrap[0].dataset.num);
    var html='';



    function add(vitridau,vitricuoi,vitriactive)
    {
        for(let i=vitridau;i<=vitricuoi;i++)
        {
            if(i==vitriactive)
            {
                html+='<li class="page-item active itemactive" data-num="'+i+'"><a class="page-link" href="javascript:;">'+i+'</a></li>';
            }
            else
            {
                html+='<li class="page-item" data-num="'+i+'" onclick="click_btn(this)"><a class="page-link" href="javascript:;">'+i+'</a></li>';
            }
            
        }
    }
    function add_first(disable,active,cham1)
    {
        if(disable==true)
        {
            html+='<li class="page-item"><span style="color:black" class="page-link" href="javascript:;">&laquo;</span></li>';
        }
        else
        {
            html+='<li class="page-item" onclick="prev()" ><a class="page-link" href="javascript:;">&laquo;</a></li>';
        }
        if(active==true)
        {
            html+='<li class="page-item active itemactive" data-num="1"><a class="page-link" href="javascript:;">1</a></li>';
        }
        else
        {
            html+='<li class="page-item" data-num="1" onclick="click_btn(this)"><a class="page-link" href="javascript:;">1</a></li>';
        }
        if(cham1==true)
        {
            html+='<li class="page-item"><span class="page-link" href="javascript:;">...</span></li>';
        }
    }

    function add_last(disable,active,cham2,max_item)
    {
        if(cham2==true)
        {
            html+='<li class="page-item" ><span class="page-link" href="javascript:;">...</span></li>';
        }
        if(active==true)
        {
            html+='<li class="page-item active itemactive" data-num="'+max_item+'"><a class="page-link" href="javascript:;">'+max_item+'</a></li>';
        }
        else
        {
            html+='<li class="page-item" data-num="'+max_item+'" onclick="click_btn(this)" ><a class="page-link" href="javascript:;">'+max_item+'</a></li>';
        }
        if(disable==true)
        {
            html+='<li class="page-item"><span style="color:black" class="page-link" href="javascript:;">&raquo;</span></li>';
        }
        else
        {
            html+='<li class="page-item" onclick="next()"><a class="page-link" href="javascript:;">&raquo;</a></li>';
        }
    } 

    function genera_html(disable,active,cham1,vitridau,vitricuoi,vitriactive,disable1,active1,cham2,max_item)
    {
        element_pagination_wrap[0].innerHTML='';
        html='';
        html+='<ul class="pagination pagination-sm">';
        add_first(disable,active,cham1);
        add(vitridau,vitricuoi,vitriactive);
        add_last(disable1,active1,cham2,max_item);
        html+='</ul>';
        element_pagination_wrap[0].innerHTML=html;
    }

    var disable_g;
    var active_g;
    var cham1_g;
    var vitridau_g;
    var vitricuoi_g;
    var vitriactive_g;
    var disable1_g;
    var active1_g;
    var cham2_g;

    function click_btn(el)
    {
        var number_active_current=parseInt(el.dataset.num);
        vitriactive_g=number_active_current;
        kiemtra_disable_g(vitriactive_g);
        kiemtra_active_g(vitriactive_g);
        kiemtra_cham1_g(vitriactive_g);
        kiemtra_vitridau_g(vitriactive_g);
        kiemtra_vitricuoi_g(vitriactive_g);
        kiemtra_disable1_g(vitriactive_g);
        kiemtra_active1_g(vitriactive_g);
        kiemtra_cham2_g(vitriactive_g);
        genera_html(disable_g,active_g,cham1_g,vitridau_g,vitricuoi_g,vitriactive_g,disable1_g,active1_g,cham2_g,max_item_g);

        
        $.get('',{phantrang:vitriactive_g,ajax:'ajax'},function(data)
        {
            var element_render_sp=document.getElementById('render_sp');
            element_render_sp.innerHTML='';
            element_render_sp.innerHTML=data;
        });

    }   
    function next()
    {

        disable_g=false;
        active_g=false;

        let position_current=parseInt(element_active[0].dataset.num);
        vitriactive_g=position_current+1;

        if(vitriactive_g>range_visibility)
        {
            cham1_g=true;
            vitridau_g=vitriactive_g-2;
        }
        else
        {
            cham1_g=false;
            vitridau_g=2;
        }

        if(range_visibility-vitriactive_g<2)
        {
            vitricuoi_g=vitriactive_g+2;
        }
        else
        {
            vitricuoi_g=range_visibility;
        }
        if(max_item_g-vitriactive_g<range_visibility)
        {
            vitricuoi_g=max_item_g-1;
        }

        if(vitriactive_g==max_item_g)
        {
            disable1_g=true;
            active1_g=true;
        }
        else
        {
            disable1_g=false;
            active1_g=false;
        }
        if(max_item_g-vitriactive_g<5)
        {
            cham2_g=false;
        }
        else
        {
            cham2_g=true;
        }
        genera_html(disable_g,active_g,cham1_g,vitridau_g,vitricuoi_g,vitriactive_g,disable1_g,active1_g,cham2_g,max_item_g);

        $.get('',{phantrang:vitriactive_g,ajax:'ajax'},function(data)
        {
            var element_render_sp=document.getElementById('render_sp');
            element_render_sp.innerHTML='';
            element_render_sp.innerHTML=data;
        });
    }
    function prev()
    {
        let position_current=parseInt(element_active[0].dataset.num);
        vitriactive_g=position_current-1;
        if(vitriactive_g==1)
        {
            disable_g=true
            active_g=true;
        }
        else
        {
            disable_g=false;
            active_g=false;
        }
        if(vitriactive_g-1<5)
        {
            cham1_g=false;
        }
        else
        {
            cham1_g=true;
        }
        if(vitriactive_g<=range_visibility)
        {
            vitridau_g=2;
        }
        else
        {
            vitridau_g=vitriactive_g-2;
        }
        if(max_item_g-vitriactive_g<3&& max_item_g>5)
        {
            vitridau_g=max_item_g-4;
        }
        if(max_item_g-vitriactive_g<5)
        {
            vitricuoi_g=max_item_g-1;
            cham2_g=false;
        }
        else
        {
            vitricuoi_g=vitriactive_g+2;
            cham2_g=true;
        }
        if(vitriactive_g==max_item_g)
        {
            disable1_g=true;
            active1_g=true;
        }
        else
        {
            disable1_g=false;
            active1_g=false;
        }
        genera_html(disable_g,active_g,cham1_g,vitridau_g,vitricuoi_g,vitriactive_g,disable1_g,active1_g,cham2_g,max_item_g);

        $.get('',{phantrang:vitriactive_g,ajax:'ajax'},function(data)
        {
            var element_render_sp=document.getElementById('render_sp');
            element_render_sp.innerHTML='';
            element_render_sp.innerHTML=data;
        });
    }


    function kiemtra_disable_g(vitriactive_hientai)
    {
        if(vitriactive_hientai==1)
        {
            disable_g=true;
        }
        else
        {
            disable_g=false;
        }
    }

    function kiemtra_active_g(vitriactive_hientai)
    {
        if(vitriactive_hientai==1)
        {
            active_g=true;
        }
        else
        {
            active_g=false;
        }
    }
    function kiemtra_cham1_g(vitriactive_hientai)
    {
        if(vitriactive_hientai>=range_visibility)
        {
            cham1_g=true;
        }
        else
        {
            cham1_g=false;
        }
    }

    function kiemtra_vitridau_g(vitriactive_hientai)
    {
        if(vitriactive_hientai<range_visibility)
        {
            vitridau_g=2;
        }
        else
        {
            vitridau_g=vitriactive_hientai-2;
        }
    }

    function kiemtra_vitricuoi_g(vitriactive_hientai)
    {
        if(range_visibility-vitriactive_hientai<2)
        {
            vitricuoi_g=vitriactive_hientai+2;
        }
        else
        {
            vitricuoi_g=5;
        }
        if(max_item_g-vitriactive_hientai<5)
        {
            vitricuoi_g=max_item_g-1;
        }
    }
    function kiemtra_disable1_g(vitriactive_hientai)
    {
        if(vitriactive_hientai==max_item_g)
        {
            disable1_g=true;
        }
        else
        {
            disable1_g=false;
        }
    }

    function kiemtra_active1_g(vitriactive_hientai)
    {
        if(vitriactive_hientai==max_item_g)
        {
            active1_g=true;
        }
        else
        {
            active1_g=false;
        }
    }

    function kiemtra_cham2_g(vitriactive_hientai)
    {
        if(max_item_g-vitriactive_hientai<5)
        {
            cham2_g=false;
        }
        else
        {
            cham2_g=true;
        }
    }

window.onload=function()
{   
    init();
}


function init()
{
    try
    {

        html='';
        disable_g=true;
        active_g=true;
        cham1_g=false;
        vitridau_g=2;
        disable1_g=false;
        active1_g=false;
        if(max_item_g<=range_visibility)
        {
            vitricuoi_g=max_item_g-1;
            vitriactive_g=0;
            
            cham2_g=false;
            
        }
        else
        {
            vitricuoi_g=range_visibility;
            vitriactive_g=0;
            cham2_g=true;
        }
        genera_html(disable_g,active_g,cham1_g,vitridau_g,vitricuoi_g,vitriactive_g,disable1_g,active1_g,cham2_g,max_item_g);
    }
    catch
    {

    }
    
}

