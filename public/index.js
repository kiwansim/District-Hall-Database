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
           //console.log(resp);
           debugData(jsonResp);
           //pullDataFields(jsonResp);
        } 
    }
}

function debugData(data) {
	var len = data.results.length;
	for (i = 0; i < len; i++) {
		console.log(data.results[i]);
	}
}

function pullDataFields(data) {
	var event_client = data.results[0].name;
	var booking_date = data.results[0].event_date;
	// extract just the time
	var booking_timeIn = data.results[0].event_start;
	var booking_timeOut = data.results[0].event_end;
	// calculate
	var booking_duration;
	// custom_field_name: event type
	var booking_type = data.results[0].custom_fields[7].value;
	var booking_room = data.results[0].rooms[0].name;
	var booking_numAttendees = data.results[0].guest_count;
	// custom_field_name: mission of the event
	var booking_description = data.results[0].custom_fields[12].value;
	// written manually
	var booking_notes;

	console.log(event_client, booking_date, booking_timeIn, booking_timeOut, booking_type, booking_room, booking_numAttendees)
};