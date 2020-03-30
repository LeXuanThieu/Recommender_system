
var element_cart_content=document.getElementById('cart-content');
$(document).on("click", '.remove', function(el) { 
    var id_remove=el.target.dataset.id;
        $.get("",{idgiohang:id_remove,ajax:'ajax'}, function(data, status){
            element_cart_content.innerHTML='';
            element_cart_content.innerHTML=data;
            });
});