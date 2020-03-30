function tru(el,soluong)
{
    var element=document.getElementById(el);
    if(element.value>1)
    {
        if(element.value>soluong)
        {
            element.value=soluong;
        }
        else
        {
            element.value--;
        }
        
    }
    else
    {
        element.value=1;
        return false;
    }
}

function cong(el,soluong)
{
    var element=document.getElementById(el);
    if(element.value<soluong)
    {
        element.value++;
    }
    else
    {
        element.value=soluong;
        return false;
    }
}
function validate(event,el)
{
    //nếu là chữ thì không cho nhập
    if(isNaN(parseInt(event.key)))
    {
        event.preventDefault();
    }
}