$(document).ready(function(){
    $("#dm-tt").click(function(){
        var w = window.innerWidth;
        if(w<=991)
        {   
            $("#list_dm").toggle('slow');
        }
      });
    
    var list_dm=document.getElementById('list_dm');
    window.onresize=function()
    {
        var w = window.innerWidth;
        console.log(w)
        if(w>991)
        {

            list_dm.style.display='block';
        }
        else
        {
            list_dm.style.display='none';
        }
    }

    var el_dm_childent=document.getElementsByClassName('dm-childent');
    var el_tintuc_new=document.getElementById('tintuc-new');
    for(let i=0;i<el_dm_childent.length;i++)
    {
        el_dm_childent[i].addEventListener('click',function(el)
        {
            var id_danhmuc=el.target.dataset.id_danhmuc;
            $.get("",{ajax:'ajax',id_danhmuc:id_danhmuc}, function(data, status){
                el_tintuc_new.innerHTML='';
                el_tintuc_new.innerHTML=data;
              });
        })
    }
})