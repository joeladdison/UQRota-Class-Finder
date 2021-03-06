var gRoomData = null;
var $xml = null;
var xmlDoc = null;
var coursesArray = null;
var buildingsSTL = {};
var buildingsGATTN = {};
var buildingsIPSWC = {};
var currentCampus = "STL";
var buildings = {};
var currentSemester = "6460"; //Hardcoded: must be updated.
var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
var longDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

$(document).ready(function () {
    $('body').scrollTop(1);

    $("#buildingRoomQuery").hide();
    $("#errorMessage").hide();
    $("#results").hide();
    $("#header").hide();
    $("#loader").hide();
    $("#header").show("slide", {
        direction: "up"
    }, 200);

    $("#buildingRoomQuery").show("slide", {
        direction: "up"
    }, 200);

    var today = new Date().getDay() - 1;
    for (var i = 0; i < days.length; i++) {
        if (today == i) {
            $("#day").append('<option value="' + days[i] + '" selected="selected">' + longDays[i] + ' (Today)</option>');
        } else {
            $("#day").append('<option value="' + days[i] + '">' + longDays[i] + '</option>');
        }
    }

    //We need to fetch the array of buildings from http://rota.eait.uq.edu.au/buildings.xml

    //Get the current semester

    // $.ajax({
    //      url:"http://rota.eait.uq.edu.au/semesters.xml",
    //      dataType: 'text',
    //      success:function(data){
    //          xmlDoc = $.parseXML(data);
    //          $xml = $(xmlDoc)

    //          $xml.find('semester').each(function(){
    //              if($(this).attr('current')=='true') {
    //                 currentSemester = $(this).text();
    //              }

    //          });

    //      },
    //      error:function(){
    //          alert("Error fetching the current semester");
    //          return
    //      }
    //  });

    $('#roomName').keyup(function (event) {
        if (event.keyCode == 13) {
            $('#selectRoom').click();
        }
    });

    $("#selectRoom").click(function () {
        showLoader();
        $("#buildingRoomQuery").hide("slide", {
            direction: "up"
        }, 200);

        //Hide the menu, show a spinner while we load.

        //Now we need to hit up rota to get the data we need.
        var course = $('#roomName')[0].value.toUpperCase();
        var shortDate = $("#day").val();

        $.ajax({
            url: 'http://rota.eait.uq.edu.au/offerings/find.xml?with={"course_code":"' + course + '","semester_id":'+currentSemester+'}',
            dataType: 'text',
            success: function (data) {
                // do stuff with json (in this case an array)
                gRoomData = data;
                //gRoomData = "<rss version='2.0'>" + gRoomData.toString + "</rss>"
                xmlDoc = $.parseXML(gRoomData);
                $xml = $(xmlDoc);

                /*
        //Filter for today's date
        var today = new Date();
        dayIndex = today.getDay();
        var todayShortDate = days[dayIndex-1]
        */
                if ($('#errorMessage').is(':visible')) {
                    $('#errorMessage').empty();
                    $('#errorMessage').hide();
                }
                if ($xml.find('offering').length === 0) {
                    $('#errorMessage').empty();
                    $('#errorMessage').append('<p class="className">Class does not exist</p>');
                    $("#loader").hide();
                    $('#errorMessage').show("slide", {
                        direction: "up"
                    }, 200);
                    $("#buildingRoomQuery").show("slide", {
                        direction: "up"
                    }, 200);
                } else {
                    $xml.find('offering > id').each(function () {
                        $.ajax({
                            url: 'http://rota.eait.uq.edu.au/offering/' + $(this).text() + '.xml',
                            dataType: 'text',
                            success: function (data) {
                                $('#results').empty();
                                $('#results').append("<h2>Classes for " + course + " on " + longDays[days.indexOf(shortDate)] + "</h2>");
                                xmlDoc2 = $.parseXML(data);
                                $xml2 = $(xmlDoc2);
                                var count = 0;
                                $xml2.find('session').each(function () {
                                    var d = $(this).find('day').text();
                                    var st = $(this).find('start').text();
                                    var fn = $(this).find('finish').text();
                                    var bname = $(this).find('name').text();
                                    var bnum = $(this).find('number').text();
                                    var camp = $(this).find('campus').text();
                                    var rm = $(this).find('room').text();
                                    var grp = $($(this).parent().parent().find("name")[0]).text();
                                    var ctype = $($(this).parent().parent().parent().parent().find("name")[0]).text();
                                    if (camp == 'STLUC') {
                                        camp = "St Lucia";
                                    } else if (camp == 'GATTN') {
                                        camp = "Gatton";
                                    } else if (camp == 'IPSWC') {
                                        camp = "Ipswich";
                                    }
                                    if ($('#day').val() == d) {
                                        var div = $('<div/>').addClass('indivClass');
                                        div.append('<p class="className">' + ctype + grp + ' | ' + st + '-' + fn + '</p>');
                                        div.append('<p class="day">' + bnum + ' (' + bname + ' - ' + camp + '), Room ' + rm + '</p>');
                                        $('#results').append(div);
                                        count++;
                                    }
                                });
                                if (count === 0) {
                                    $('#results').append('<p class="className">' + course + ' is not on ' + longDays[days.indexOf(shortDate)] + '.</p>');
                                    $('#results').append('<p class="day">Try a different day?</p>');
                                }
                                $("#loader").hide();
                                showResults();
                            }
                        });

                    });

                }
            }
        });
    });

    $("#header").click(function () {
        $("#results").hide("slide", {
            direction: "up"
        }, 200);
        $("#buildingRoomQuery").show("slide", {
            direction: "up"
        }, 200);
    });

});

function showLoader() {
    $("#loader").fadeIn('slow');
}

function showResults() {
    $("#results").fadeIn('slow');
    $("#buildingRoomQuery").hide("slide", {
        direction: "up"
    }, 200);
}


function hideErrorMessage() {
    $("#errorMessage").hide("slide", {
        direction: "up"
    }, 200);
}
