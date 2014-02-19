$(".area1").click( function(){
    $(this).css("background", "rgba(255, 112, 0, 0.43)");
    $(this).css("border", "5px solid rgba(255, 112, 0, 0.43)");

    window.location = 'L1E.html';
    return false;
});

$(".goback").click( function(){
    window.location = 'master.html';
    return false;
});

$(".brandLogo").click( function(){
    window.location = 'index.html';
    return false;
});