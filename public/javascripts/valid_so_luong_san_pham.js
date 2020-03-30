

function cong(qtym)
{
    
    if(qtym.value<100)
    {
        qtym.value++;
    }
    else
    {
        return false;
    }
}

function tru(qtym)
{
    if(qtym.value>1)
    {
        qtym.value--;
    }
    else
    {
        return false;
    }
}

function validate(event,qtym)
{

    //nếu là chữ thì không cho nhập
    if(isNaN(parseInt(event.key)))
    {
        event.preventDefault();
    }
}