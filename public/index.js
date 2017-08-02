$( function() {
   	$( ".datepicker" ).datepicker();
} );

function genQueryURL() {
	var start = $( "#start" ).datepicker({ dateFormat: 'mm/dd/yyyy' }).val();
	var end = $( "#end" ).datepicker({ dateFormat: 'mm/dd/yyyy' }).val();
	var start2 = start.toString();
	var end2 = end.toString();
//	check if this location_id is even working
	var url = 'http://api.tripleseat.com/v1/events/search.json?status=definite&location_ids=4520&event_start_date=' + start2 + '&event_end_date=' + end2;
//	console.log("url in genQueryURL", url);
	requestData(url);
}

function requestData(url) {
//	console.log("url in requestData", url);
	var request = new XMLHttpRequest();
	var uri = "http://localhost:5000/query"
	var params = "url=" + url;
    request.open("POST", uri, true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(params);

    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
           var resp = request.responseText;
           var jsonResp = JSON.parse(resp);
           //console.log(jsonResp);
           //debugData(jsonResp);
           parseData(jsonResp);
        } 
    }
}

function debugData(data) {
	var len = data.results.length;
	for (i = 0; i < len; i++) {
		console.log(data.results[i]);
	}
}

function parseData(data) {
	var len = data.results.length;
	var events = [];
	for (i = 0; i < len; i++) {
		var current = data.results[i];
	//	console.log(current.event_start);
	//	Date date = new SimpleDateFormat("MM-dd-yyyy HH:mm").parse(current.event_start);
	//	var newdate = new SimpleDateFormat("HH:mm").format(date);
	//	console.log(newdate);
		var eventJSON = {
			"event_client": current.name,
			"b_date": current.event_date,
			"b_timeIn": getTime(current.event_start),
			"b_timeOut":  getTime(current.event_end),
			"b_duration": getDuration(current.event_start, current.event_end),
			// custom_field_name: event type
			"b_type": data.results[0].custom_fields[7].value,
			"b_room": data.results[0].rooms[0].name,
			"b_numAttendees": data.results[0].guest_count,
			// custom_field_name: mission of the event
			"b_description": data.results[0].custom_fields[12].value,
			// written manually
			/*"b_notes":
			"f_value":
			"f_usageFee":
			"f_reduction":
			"f_numReduced":
			"f_numInnovation":
			"f_paymentSystem":
			"f_transactionNum":
			"f_datePaid":
			"sp_onMission":
			"sp_npoStartup":
			"sp_publicCalendar":
			"sp_freeAttendance":*/
		}
		//console.log(eventJSON);
		events.push(eventJSON);
	}
	console.log(events);
};

function getTime(data) {
	var myDate = new Date(data);
	var hrs = myDate.getHours();
	var mins = myDate.getMinutes();
	// formatting purposes only
	if (mins == "0"){
		mins = "00";
	}
	return hrs + ":" + mins;
}

function getDuration(start, end) {
	var startDate = new Date(start);
	var endDate = new Date(end);
	var timeDiff = new Date(endDate - startDate);
	console.log(endDate, startDate, timeDiff);
}

function testInsert() {
	var request = new XMLHttpRequest();
	var uri = "http://localhost:5000/insertdata"
	var params = "event=HOLD";
    request.open("POST", uri, true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(params);	
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
        	console.log("TestInsert was successfully executed");
        }
    }

}
// left off at getting a NaN for timeDiff

	/*var event_client = data.results[0].name;
	var b_date = data.results[0].event_date;
	// extract just the time
	var b_timeIn = data.results[0].event_start;
	var b_timeOut = data.results[0].event_end;
	// calculate
	var b_duration;
	// custom_field_name: event type
	var b_type = data.results[0].custom_fields[7].value;
	var b_room = data.results[0].rooms[0].name;
	var b_numAttendees = data.results[0].guest_count;
	// custom_field_name: mission of the event
	var b_description = data.results[0].custom_fields[12].value;
	// written manually
	var b_notes;

	var f_value
	var f_usageFee
	var f_reduction
	var f_numReduced
	var f_numInnovation
	var f_paymentSystem
	var f_transactionNum
	var f_datePaid

	var sp_onMission
	var sp_npoStartup
	var sp_publicCalendar
	var sp_freeAttendance*/