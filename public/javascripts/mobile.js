$(document).ready(function(){

  // hiệu ứng slide nav

  //bật
  $('#menu-bar').click(function()
  {
      $('#MySlidenav').addClass('open-sidebar-nav');
      $('#hidden-md').addClass('open-opacity-mb');
  });
  
  //tắt
  $('#hidden-md').click(function()
  {
      $('#MySlidenav').removeClass('open-sidebar-nav');
      $('#hidden-md').removeClass('open-opacity-mb');
  });
  
  var trangchu=(window.location.href=="http://localhost:3000/");
  var w;
  //nếu không phải là trang chủ thì ẩn
  if(!trangchu)
  {
    $('.block-content').hide();
  }
  
 var block_content=document.getElementsByClassName('block-content');

  // window.addEventListener('resize',function()
  // {
  //     w=window.innerWidth;
  //     console.log(w)
  //     nếu đúng thì kiểm tra nếu w=991 thì tự động ẩn còn nếu trên thì tự động hiện
      

  // });
  var element_danhmuc_click=document.getElementsByClassName('block-title-button');
  
  element_danhmuc_click[0].onclick=function()
  {
    if(trangchu)
    {
      w=window.innerWidth;
      if(w<=991)
      {
        $('.block-content').toggle();
      }
    }
    else
    {
      $('.block-content').toggle();
    }
  }

});