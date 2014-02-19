var mode = 9999; // 1:gray, 2:commit, 3:done, 0: clear all
var commitPermit = 9999;

var workNeeded = 0; // grid pending to be done
var donePect = 0; // done %
var totalGrid = 42;

var myDataRef  = new Firebase('https://aechack.firebaseio.com/');
var sheetData  = new Firebase('https://aechack.firebaseio.com/sheet/L1E/');
var areaData   = new Firebase('https://aechack.firebaseio.com/sheet/L1E/area/');

sheetData.once('value', function(snapshot) { // <=========== load mode when first load 
    var object = snapshot.val();
    mode = object.mode;

    if ( mode==1 ) {
        $('#adminMode').attr("checked",true);
        $(".rightMsg > p").text("Admin Mode");
        $("#adminMode").click();
    }    
});

sheetData.on('value', function(snapshot) {
    var object = snapshot.val();
    var isChecked = $('#adminMode').is(':checked');
    commitPermit = object.commitPermit; // <============== read commitPermit
    console.log("commitPermit: "+commitPermit);

    if ( commitPermit == 1 && isChecked == false) { 
        mode = 2;
        sheetData.update({"mode": 2});
        $(".rightMsg > p").text("To Begin, Please Commit First");
        $(".rightMsg > p").addClass("blink");
        $("div.commitConfirm").show();
    }
    else if (isChecked) {
        mode = 1;
        sheetData.update({"mode": 1});
        $(".rightMsg > p").text("Admin Mode");
        $(".rightMsg > p").removeClass("blink");
        $("div.commitConfirm").hide();
    }
    else {
        mode == 3;
        sheetData.update({"mode": 3});
        $(".rightMsg > p").removeClass("blink");
        $("div.commitConfirm").hide();
    }
});

$("#adminMode").click(function(){
    var isChecked = $('#adminMode').is(':checked');
    console.log("isChecked: "+isChecked);

    if (isChecked) {
        mode = 1;
        sheetData.update({"mode": 1});
        $(".rightMsg > p").text("Admin Mode");
        $(".rightMsg > p").removeClass("blink");
        $("div.commitConfirm").hide();
    }
    else if (commitPermit == 1 ) {
        mode = 2;
        sheetData.update({"mode": 2}); 
        $(".rightMsg > p").text("To Begin, Please Commit First");
        $(".rightMsg > p").addClass("blink");
        $("div.commitConfirm").show();
    }
    else {
        mode = 3;
        sheetData.update({"mode": 3});
        $(".rightMsg > p").removeClass("blink");
        $("div.commitConfirm").hide();
        
        $(".rightMsg > p").hide();
        $(".rightMsg > p").text("Ready");
        $(".rightMsg > p").fadeIn("slow");
    }
});

$("div.commitConfirm").click( function(){
    mode = 3;
    console.log("Confirm click: "+mode);
    commitPermit = 0;
    sheetData.update({"commitPermit": 0}); // <======== IMP!! commitPermit need to be updated first
    sheetData.update({"mode": 3});
    $(".rightMsg > p").removeClass("blink");
    $("div.commitConfirm").hide();
    $(".rightMsg > p").hide();
    $(".rightMsg > p").text("Ready");
    $(".rightMsg > p").fadeIn("slow");

});

// Load Data & Live Update
areaData.on('value', function(snapshot) {
    var object = snapshot.val();
    var grayCount = 0;
    var doneCount = 0;
    console.log("on/vlaue triggered");

    $.each(object, function (k,v){
        var target = "."+k;
        if (v==1) { 
            $(target).removeClass("commit");
            $(target).removeClass("done");
            $(target).addClass("gray"); 
            grayCount += 1; 
        };
        if (v==2) { 
            $(target).removeClass("gray");
            $(target).removeClass("done");
            $(target).addClass("commit"); 
        };
        if (v==3) { 
            $(target).removeClass("gray");
            $(target).removeClass("commit");
            $(target).addClass("done"); 
            doneCount += 1; 
        };
        if (v==0) { 
            $(target).removeClass("gray");
            $(target).removeClass("commit");
            $(target).removeClass("done");
        };

    });

    workNeeded = totalGrid - grayCount;
    console.log("workNeeded: "+workNeeded);
    console.log("doneCount: "+doneCount);

    donePect = Math.round((doneCount/workNeeded)*100);
    console.log("donePect: "+donePect);

    $(".rightMsg > p").text(donePect+"% Complete");
});

// On Click
$(".areaGrid").click( function(){
    if ( mode == 1 ) {
        $(this).removeClass("commit");
        $(this).removeClass("done");
        $(this).toggleClass("gray");
        idClicked = $(this).attr("id"); // detect id
        console.log(idClicked);

        if ($(this).hasClass("gray")) { dataupdate( mode, idClicked, 1 ); }
            else { dataupdate( mode, idClicked, 0 ); }            
    }
    else if ( mode == 2 && $(this).hasClass("gray") == false ) {
        $(this).removeClass("done");
        $(this).toggleClass("commit");
        idClicked = $(this).attr("id"); // detect id
        console.log(idClicked);

        if ($(this).hasClass("commit")) { dataupdate( mode, idClicked, 1 ); }
            else { dataupdate( mode, idClicked, 0 ); }
    }
    else if ( mode == 3 && $(this).hasClass("gray") == false ) {
        $(this).removeClass("commit");
        $(this).toggleClass("done");
        idClicked = $(this).attr("id"); // detect id
        console.log(idClicked);

        if ($(this).hasClass("done")) { dataupdate( mode, idClicked, 1 ); }
            else { dataupdate( mode, idClicked, 0 ); }
    }
    else if ($(this).hasClass("gray") == true) {
        console.log("click on gray, do nothing");
    }
    else { console.log("mode: "+mode) }
});

$(".goback").click( function(){
    window.location = 'L1.html';
    return false;
});

$(".brandLogo").click( function(){
    window.location = 'index.html';
    return false;
});

// control from reset.html
$(".resetCommit").click( function (e){
    e.preventDefault();
    sheetData.update({"commitPermit": 1});   
});

$(".resetAll").click( function (e){
    e.preventDefault();
    for (var i=1; i<=totalGrid; i++) {
        var idClicked = "g"+i;
        var id = "#"+idClicked;

        $(id).removeClass("gray");
        $(id).removeClass("commit");
        $(id).removeClass("done");

        dataupdate( mode, idClicked, 0 ); 
    };
});







function dataupdate(mode, idClicked, operation){
    if ( mode == 1 && operation == 1 ) {
        console.log("chk: "+idClicked);
        if (idClicked == "g1")  { areaData.update({"g1":  1}) };
        if (idClicked == "g2")  { areaData.update({"g2":  1}) };
        if (idClicked == "g3")  { areaData.update({"g3":  1}) };
        if (idClicked == "g4")  { areaData.update({"g4":  1}) };
        if (idClicked == "g5")  { areaData.update({"g5":  1}) };
        if (idClicked == "g6")  { areaData.update({"g6":  1}) };
        if (idClicked == "g7")  { areaData.update({"g7":  1}) };
        if (idClicked == "g8")  { areaData.update({"g8":  1}) };
        if (idClicked == "g9")  { areaData.update({"g9":  1}) };
        if (idClicked == "g10") { areaData.update({"g10": 1}) };
        if (idClicked == "g11") { areaData.update({"g11": 1}) };
        if (idClicked == "g12") { areaData.update({"g12": 1}) };
        if (idClicked == "g13") { areaData.update({"g13": 1}) };
        if (idClicked == "g14") { areaData.update({"g14": 1}) };
        if (idClicked == "g15") { areaData.update({"g15": 1}) };
        if (idClicked == "g16") { areaData.update({"g16": 1}) };
        if (idClicked == "g17") { areaData.update({"g17": 1}) };
        if (idClicked == "g18") { areaData.update({"g18": 1}) };
        if (idClicked == "g19") { areaData.update({"g19": 1}) };
        if (idClicked == "g20") { areaData.update({"g20": 1}) };
        if (idClicked == "g21") { areaData.update({"g21": 1}) };
        if (idClicked == "g22") { areaData.update({"g22": 1}) };
        if (idClicked == "g23") { areaData.update({"g23": 1}) };
        if (idClicked == "g24") { areaData.update({"g24": 1}) };
        if (idClicked == "g25") { areaData.update({"g25": 1}) };
        if (idClicked == "g26") { areaData.update({"g26": 1}) };
        if (idClicked == "g27") { areaData.update({"g27": 1}) };
        if (idClicked == "g28") { areaData.update({"g28": 1}) };
        if (idClicked == "g29") { areaData.update({"g29": 1}) };
        if (idClicked == "g30") { areaData.update({"g30": 1}) };
        if (idClicked == "g31") { areaData.update({"g31": 1}) };
        if (idClicked == "g32") { areaData.update({"g32": 1}) };
        if (idClicked == "g33") { areaData.update({"g33": 1}) };
        if (idClicked == "g34") { areaData.update({"g34": 1}) };
        if (idClicked == "g35") { areaData.update({"g35": 1}) };
        if (idClicked == "g36") { areaData.update({"g36": 1}) };
        if (idClicked == "g37") { areaData.update({"g37": 1}) };
        if (idClicked == "g38") { areaData.update({"g38": 1}) };
        if (idClicked == "g39") { areaData.update({"g39": 1}) };
        if (idClicked == "g40") { areaData.update({"g40": 1}) };
        if (idClicked == "g41") { areaData.update({"g41": 1}) };
        if (idClicked == "g42") { areaData.update({"g42": 1}) };
    } 

    else if ( mode == 2 && operation == 1 ) {
        console.log("chk: "+idClicked);
        if (idClicked == "g1")  { areaData.update({"g1":  2}) };
        if (idClicked == "g2")  { areaData.update({"g2":  2}) };
        if (idClicked == "g3")  { areaData.update({"g3":  2}) };
        if (idClicked == "g4")  { areaData.update({"g4":  2}) };
        if (idClicked == "g5")  { areaData.update({"g5":  2}) };
        if (idClicked == "g6")  { areaData.update({"g6":  2}) };
        if (idClicked == "g7")  { areaData.update({"g7":  2}) };
        if (idClicked == "g8")  { areaData.update({"g8":  2}) };
        if (idClicked == "g9")  { areaData.update({"g9":  2}) };
        if (idClicked == "g10") { areaData.update({"g10": 2}) };
        if (idClicked == "g11") { areaData.update({"g11": 2}) };
        if (idClicked == "g12") { areaData.update({"g12": 2}) };
        if (idClicked == "g13") { areaData.update({"g13": 2}) };
        if (idClicked == "g14") { areaData.update({"g14": 2}) };
        if (idClicked == "g15") { areaData.update({"g15": 2}) };
        if (idClicked == "g16") { areaData.update({"g16": 2}) };
        if (idClicked == "g17") { areaData.update({"g17": 2}) };
        if (idClicked == "g18") { areaData.update({"g18": 2}) };
        if (idClicked == "g19") { areaData.update({"g19": 2}) };
        if (idClicked == "g20") { areaData.update({"g20": 2}) };
        if (idClicked == "g21") { areaData.update({"g21": 2}) };
        if (idClicked == "g22") { areaData.update({"g22": 2}) };
        if (idClicked == "g23") { areaData.update({"g23": 2}) };
        if (idClicked == "g24") { areaData.update({"g24": 2}) };
        if (idClicked == "g25") { areaData.update({"g25": 2}) };
        if (idClicked == "g26") { areaData.update({"g26": 2}) };
        if (idClicked == "g27") { areaData.update({"g27": 2}) };
        if (idClicked == "g28") { areaData.update({"g28": 2}) };
        if (idClicked == "g29") { areaData.update({"g29": 2}) };
        if (idClicked == "g30") { areaData.update({"g30": 2}) };
        if (idClicked == "g31") { areaData.update({"g31": 2}) };
        if (idClicked == "g32") { areaData.update({"g32": 2}) };
        if (idClicked == "g33") { areaData.update({"g33": 2}) };
        if (idClicked == "g34") { areaData.update({"g34": 2}) };
        if (idClicked == "g35") { areaData.update({"g35": 2}) };
        if (idClicked == "g36") { areaData.update({"g36": 2}) };
        if (idClicked == "g37") { areaData.update({"g37": 2}) };
        if (idClicked == "g38") { areaData.update({"g38": 2}) };
        if (idClicked == "g39") { areaData.update({"g39": 2}) };
        if (idClicked == "g40") { areaData.update({"g40": 2}) };
        if (idClicked == "g41") { areaData.update({"g41": 2}) };
        if (idClicked == "g42") { areaData.update({"g42": 2}) };
    }

    else if ( mode == 3 && operation == 1 ) {
        console.log("chk: "+idClicked);
        if (idClicked == "g1")  { areaData.update({"g1":  3}) };
        if (idClicked == "g2")  { areaData.update({"g2":  3}) };
        if (idClicked == "g3")  { areaData.update({"g3":  3}) };
        if (idClicked == "g4")  { areaData.update({"g4":  3}) };
        if (idClicked == "g5")  { areaData.update({"g5":  3}) };
        if (idClicked == "g6")  { areaData.update({"g6":  3}) };
        if (idClicked == "g7")  { areaData.update({"g7":  3}) };
        if (idClicked == "g8")  { areaData.update({"g8":  3}) };
        if (idClicked == "g9")  { areaData.update({"g9":  3}) };
        if (idClicked == "g10") { areaData.update({"g10": 3}) };
        if (idClicked == "g11") { areaData.update({"g11": 3}) };
        if (idClicked == "g12") { areaData.update({"g12": 3}) };
        if (idClicked == "g13") { areaData.update({"g13": 3}) };
        if (idClicked == "g14") { areaData.update({"g14": 3}) };
        if (idClicked == "g15") { areaData.update({"g15": 3}) };
        if (idClicked == "g16") { areaData.update({"g16": 3}) };
        if (idClicked == "g17") { areaData.update({"g17": 3}) };
        if (idClicked == "g18") { areaData.update({"g18": 3}) };
        if (idClicked == "g19") { areaData.update({"g19": 3}) };
        if (idClicked == "g20") { areaData.update({"g20": 3}) };
        if (idClicked == "g21") { areaData.update({"g21": 3}) };
        if (idClicked == "g22") { areaData.update({"g22": 3}) };
        if (idClicked == "g23") { areaData.update({"g23": 3}) };
        if (idClicked == "g24") { areaData.update({"g24": 3}) };
        if (idClicked == "g25") { areaData.update({"g25": 3}) };
        if (idClicked == "g26") { areaData.update({"g26": 3}) };
        if (idClicked == "g27") { areaData.update({"g27": 3}) };
        if (idClicked == "g28") { areaData.update({"g28": 3}) };
        if (idClicked == "g29") { areaData.update({"g29": 3}) };
        if (idClicked == "g30") { areaData.update({"g30": 3}) };
        if (idClicked == "g31") { areaData.update({"g31": 3}) };
        if (idClicked == "g32") { areaData.update({"g32": 3}) };
        if (idClicked == "g33") { areaData.update({"g33": 3}) };
        if (idClicked == "g34") { areaData.update({"g34": 3}) };
        if (idClicked == "g35") { areaData.update({"g35": 3}) };
        if (idClicked == "g36") { areaData.update({"g36": 3}) };
        if (idClicked == "g37") { areaData.update({"g37": 3}) };
        if (idClicked == "g38") { areaData.update({"g38": 3}) };
        if (idClicked == "g39") { areaData.update({"g39": 3}) };
        if (idClicked == "g40") { areaData.update({"g40": 3}) };
        if (idClicked == "g41") { areaData.update({"g41": 3}) };
        if (idClicked == "g42") { areaData.update({"g42": 3}) };
    }

    else {
        console.log("chk: "+idClicked);
        console.log("operation: 0");
        if (idClicked == "g1")  { areaData.update({"g1":  0}) };
        if (idClicked == "g2")  { areaData.update({"g2":  0}) };
        if (idClicked == "g3")  { areaData.update({"g3":  0}) };
        if (idClicked == "g4")  { areaData.update({"g4":  0}) };
        if (idClicked == "g5")  { areaData.update({"g5":  0}) };
        if (idClicked == "g6")  { areaData.update({"g6":  0}) };
        if (idClicked == "g7")  { areaData.update({"g7":  0}) };
        if (idClicked == "g8")  { areaData.update({"g8":  0}) };
        if (idClicked == "g9")  { areaData.update({"g9":  0}) };
        if (idClicked == "g10") { areaData.update({"g10": 0}) };
        if (idClicked == "g11") { areaData.update({"g11": 0}) };
        if (idClicked == "g12") { areaData.update({"g12": 0}) };
        if (idClicked == "g13") { areaData.update({"g13": 0}) };
        if (idClicked == "g14") { areaData.update({"g14": 0}) };
        if (idClicked == "g15") { areaData.update({"g15": 0}) };
        if (idClicked == "g16") { areaData.update({"g16": 0}) };
        if (idClicked == "g17") { areaData.update({"g17": 0}) };
        if (idClicked == "g18") { areaData.update({"g18": 0}) };
        if (idClicked == "g19") { areaData.update({"g19": 0}) };
        if (idClicked == "g20") { areaData.update({"g20": 0}) };
        if (idClicked == "g21") { areaData.update({"g21": 0}) };
        if (idClicked == "g22") { areaData.update({"g22": 0}) };
        if (idClicked == "g23") { areaData.update({"g23": 0}) };
        if (idClicked == "g24") { areaData.update({"g24": 0}) };
        if (idClicked == "g25") { areaData.update({"g25": 0}) };
        if (idClicked == "g26") { areaData.update({"g26": 0}) };
        if (idClicked == "g27") { areaData.update({"g27": 0}) };
        if (idClicked == "g28") { areaData.update({"g28": 0}) };
        if (idClicked == "g29") { areaData.update({"g29": 0}) };
        if (idClicked == "g30") { areaData.update({"g30": 0}) };
        if (idClicked == "g31") { areaData.update({"g31": 0}) };
        if (idClicked == "g32") { areaData.update({"g32": 0}) };
        if (idClicked == "g33") { areaData.update({"g33": 0}) };
        if (idClicked == "g34") { areaData.update({"g34": 0}) };
        if (idClicked == "g35") { areaData.update({"g35": 0}) };
        if (idClicked == "g36") { areaData.update({"g36": 0}) };
        if (idClicked == "g37") { areaData.update({"g37": 0}) };
        if (idClicked == "g38") { areaData.update({"g38": 0}) };
        if (idClicked == "g39") { areaData.update({"g39": 0}) };
        if (idClicked == "g40") { areaData.update({"g40": 0}) };
        if (idClicked == "g41") { areaData.update({"g41": 0}) };
        if (idClicked == "g42") { areaData.update({"g42": 0}) };
    };
};
