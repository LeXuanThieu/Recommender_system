window.onload=function()
{
    var element_checkpass=document.getElementById('btn-checkpass');
    var el_matkhaumoi=document.getElementById('matkhaumoi');
    var el_xacnhanmatkhaumoi=document.getElementById('xacnhanmatkhaumoi');
    element_checkpass.onclick=function()
    {
        if(el_matkhaumoi.value!=el_xacnhanmatkhaumoi.value||el_matkhaumoi.value==''||el_xacnhanmatkhaumoi.value=='')
        {
            return false;
        }
    }
}