// find out how to delete events after each request
//var events = [];
//var events = {"ev_objs": {}};
//var events = {"results": []};


// calendar on UI
$( function() {
   	$( ".datepicker" ).datepicker();
} );

function testInsert() {
	var request = new XMLHttpRequest();
	var uri = "http://localhost:5000/insertdata"
	var params = "event=HOLD";
    request.open("POST", uri, true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
        	console.log("TestInsert was successfully executed");
        }
    }
    request.send(params);	

}

function dbInsert(event_arr) {
	/*console.log("in db insert", event_arr);
	console.log(JSON.stringify(event_arr));*/
	//for (event_arr.results.length)
	$.ajax({
		url: "http://localhost:5000/insertdata",
		type: "POST",
		data: JSON.stringify(event_arr),
		contentType: "application/json",
		success: function(events) {
			console.log("TestInsert was successfully executed");
		},
		error: function(textStatus, errorThrown) {
			console.error("The following error occurred: " + textStatus, errorThrown);
		}
	}).done(function(data, statusText, xhr){
  		var status = xhr.status;                //200
  		var head = xhr.getAllResponseHeaders(); //Detail header info
  		console.log("dbInsert executed with status code ", status);
	});
}

function genQueryURL() {
	var start = $( "#start" ).datepicker({ dateFormat: 'mm/dd/yyyy' }).val();
	var end = $( "#end" ).datepicker({ dateFormat: 'mm/dd/yyyy' }).val();
	var start2 = start.toString();
	var end2 = end.toString();
	var url = 'http://api.tripleseat.com/v1/events/search.json?status=definite&location_ids=4520&event_start_date=' + start2 + '&event_end_date=' + end2;
//	console.log("url in genQueryURL", url);
	requestData(url);
}

function requestData(url) {
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
           parseData(jsonResp, function(event_arr) {
           		dbInsert(event_arr);
           		//console.log("in the callback for parasdata", event_arr);
           });
        } 
    }
}

/* V3
function parseData(data, callback) {
	var events = {};
	var counter = 0;
    data.results.forEach(function(element, index) {
    	var account = element.account_id;
    	requestAccountData(element, account, function(resp) {
    		var key = "result" + counter;
    		console.log(key);
        	events[key] = resp;
        	//console.log("updated events object", events);
       		counter ++;
        	if (counter  == data.results.length) {
            	//console.log("this is what events looks like after parseData", events);
            	callback(events);
        	}
   		});
	});	
}*/

// V2
function parseData(data, callback) {
	var events = {"results": []}
    var counter = 0;
    data.results.forEach(function(element, index) {
    	var account = element.account_id;
    	console.log(element);
    	requestAccountData(element, account, function(resp) {
        	//console.log("-----THE FOLLOWING IS PRINTED AFTER EACH ITERATION-----");
       		//console.log("completed eventJSON:", resp);
        	events.results.push(resp);
        	//console.log("updated events object", events);
       		counter ++;
        	if (counter  == data.results.length) {
            	//console.log("this is what events looks like after parseData", events);
            	callback(events);
        	}
   		});
	});
};

/* V1
function parseData(data, callback) {


	var events = {results: []};
	data.results.forEach(function(element, index) {
		var account = element.account_id;
		requestAccountData(element, account, function(resp) {
			console.log("-----THE FOLLOWING IS PRINTED AFTER EACH ITERATION-----");
			console.log("completed eventJSON:", resp);
			events.results.push(resp);
			console.log("updated events object", events);
		});
	});
	
	console.log("this is what events looks like after parseData", events);
	callback(events);
};*/

function requestAccountData(event, account, fn) {
	var url = 'http://api.tripleseat.com/v1/accounts/' + account + '.json';
	var request = new XMLHttpRequest();
	var uri = "http://localhost:5000/account"
	var params = "url=" + url;
    request.open("POST", uri, true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(params);

    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
           var resp = request.responseText;
           var jsonResp = JSON.parse(resp);
           var newResp = setRespJSON(event, jsonResp);
           //console.log(newResp);
           fn(newResp);
        } 
    }
}


function setRespJSON(event, account) {
	//getDuration(event.event_start, event.event_end);
	var rooms = setRooms(event.rooms);

	var respJSON = {
		"event_client": event.name,
		"b_date": event.event_date,
		"b_timeIn": getTime(event.event_start),
		"b_timeOut":  getTime(event.event_end),
		"b_duration": getDuration(event.event_start, event.event_end),
// delete event vs meeting 
		"b_type": "?", 
		"b_room": setRooms(event.rooms),
		"b_numAttendees": setNumericValue(event.guest_count),
// where do i get this
//event mission and why host
		"b_description": "--",
// manual 
		"b_notes": "--", 
		"f_value": setNumericValue(event.actual_amount),
		"f_usageFee": setNumericValue(event.grand_total),
		"f_reduction": setReduction(event.actual_amount, event.grand_total),
		"f_numReduced": 0,
		"f_numInnovation": 0,
// stripe integration or
		"f_paymentSystem": "--",
		"f_transactionNum": "--",
// is the date due consistent with date paid?? this is not on tripleseat
		"f_datePaid": "?",

		"sp_onMission": 0,
		"sp_npoStartup": 0,
		"sp_publicCalendar": 0,
		"sp_freeAttendance": 0,
		"type_conferenceWorkshop": 0,
		"type_meeting": 0,
		"type_lecturePanel": 0,
		"type_tour": 0,
		"type_hackathon": 0,
		"type_meetup": 0,
		"type_networking": 0,
		"type_social": 0,
		"i_entrepreneurs": 0,
		"i_startups": 0, 
		"i_incAccel": 0,
		"i_innoCommunity": 0,
		"i_vcAngel": 0,
		"i_makers": 0,

// sector tags on Tripleseat is inconsistent
		"sect_lifeScience": 0,
		"sect_tech": 0,
		"sect_robotics": 0, 
		"sect_education": 0,
		"sect_socialImpact": 0,
		"sect_sustainability": 0,
		"sect_creative": 0,
		"sect_law": 0,
		"sect_financeInsurance": 0,
		"sect_multisector": 0,
		"sect_npo": 0,
		"sect_global": 0,
		"sect_government": 0,
		"sect_community": 0,
		"sect_largeCosOrgs": 0
	}
	setSectorAnalysis(account, respJSON);
	setCustomFields(event.custom_fields, respJSON);
	return respJSON;
}

function getTime(data) {
	var myDate = new Date(data);
	var hrs = myDate.getHours();
	var mins = myDate.getMinutes();
	// formatting purposes only
	if (mins == "0"){
		mins = "00";
	}
	var result = hrs + ':' + mins;
	console.log(result);
	return result;
}

function getDuration(start, end) {
	var startDate = new Date(start);
	var endDate = new Date(end);
	// unsure why /1000 but 3600 is num min in hr
	var timeDiff = ((endDate - startDate) / 1000)/60;
	var diff_hr = Math.floor(timeDiff / 60);
	var diff_min = timeDiff % 60;

	if (diff_min == "0"){
		diff_min = "00";
	}
	var result = diff_hr + ':' + diff_min;
	return result;
}

function setRooms(data) {
	var rooms = "";
	for (var i = 0; i < data.length; i++) {
		if (i == 0) {
			rooms = data[i].name;
		} else {
			rooms = rooms + ", " + data[i].name;
		}	
	}
	return rooms;
}

function setNumericValue(data) {
	var value = 0;
	if (data != null) {
		value = data;
	}

	return value;
}

function setReduction(actual, total) {
	return (actual - total);
}


function setSectorAnalysis(data, respJSON) {
	//console.log(data);
	var parsed = JSON.parse(data);
	var fields = parsed.account.custom_fields;

	for (var i = 0; i < fields.length; i++) {
		var current = fields[i];
		if (current.custom_field_id == 14564 && current.value != null) {
			var arr = current.value.split(",")
			for (var j = 0; j < arr.length; j++) {
				arr[j] = arr[j].trim();
				if (arr[j] == "Life Science") {
					respJSON.sect_lifeScience = 1;
				} else if (arr[j] == "Tech") {
					respJSON.sect_tech = 1;
				} else if (arr[j] == "Robotics") {
					respJSON.sect_robotics = 1;
				} else if (arr[j] == "Education") {
					respJSON.sect_education = 1;
				} else if (arr[j] == "Social Impact") {
					respJSON.sect_socialImpact = 1;
				} else if (arr[j] == "Sustainability") {
					respJSON.sect_sustainability = 1;
				} else if (arr[j] == "Creative") {
					respJSON.sect_creative = 1;
				} else if (arr[j] == "Law") {
					respJSON.sect_law = 1;
				} else if (arr[j] == "Finance/Insurance") {
					respJSON.sect_financeInsurance = 1;
				} else if (arr[j] == "Community") {
					respJSON.sect_community = 1;
				} 
			}
		}
	}
}

function setCustomFields(data, respJSON) {
	for (var i = 0; i < data.length; i++) {
		var current = data[i];
		 // Event Type
		if (current.custom_field_id == 17481 && current.value != null) {
			var arr = current.value.split(",")
			for (var j = 0; j < arr.length; j++) {
				arr[j] = arr[j].trim();
				if (arr[j] == "Meeting") {
					respJSON.type_meeting = 1;
				} else if (arr[j] == "Conference/workshop") {
					respJSON.type_conferenceWorkshop = 1;
				} else if (arr[j] == "Lecture/Panel") {
					respJSON.type_lecturePanel = 1;
				} else if (arr[j] == "Meetup") {
					respJSON.type_meetup = 1;
				} else if (arr[j] == "Networking") {
					respJSON.type_networking = 1;
				} else if (arr[j] == "Hackathon") {
					respJSON.type_hackathon = 1;
				} else if (arr[j] == "Social") {
					respJSON.type_social = 1;
				} else if (arr[j] == "Tour") {
					respJSON.type_tour = 1;
				}
			}
		// Mission of the Event
		} else if (current.custom_field_id == 17484 && current.value != null) {
			if (data.value != null) {
				respJSON.b_description = data.value;
			} 
		// Cost Reduction?
		} else if (current.custom_field_id == 17532 && current.value != null) { 
			respJSON.f_numReduced = 1;
		// Sponsorship Criteria
		} else if (current.custom_field_id == 17483 && current.value != null) { 
			var arr = current.value.split(",")
			for (j = 0; j < arr.length; j++) {
				arr[j] = arr[j].trim();
				if (arr[j] == "On Mission") {
					//spon_onMiss = 1;
					respJSON.sp_onMission = 1;
				} else if (arr[j] == "Non-profit / Startup") {
					//spon_npo = 1;
					respJSON.sp_npoStartup = 1;
				} else if (arr[j] == "Listed on Public Calendar") {
					//spon_pubcal = 1;
					respJSON.sp_publicCalendar = 1;
				} else if (arr[j] == "Free to Attend") {
					//spon_free = 1;
					respJSON.sp_freeAttendance = 1;
				} 
			}		
		// Innovation Qualifiers - Event
		} else if (current.custom_field_id == 17480 && current.value != null) {
			var arr = current.value.split(",")
			if (arr.length > 1) {
				respJSON.f_numInnovation = 1;
			}
		// Innovation Qualifiers - Event Audience
		} else if (current.custom_field_id == 17482 && current.value != null) {
			var arr = current.value.split(",")
			for (j = 0; j < arr.length; j++) {
				arr[j] = arr[j].trim();
				if (arr[j] == "Entrepreneurs") {
					respJSON.i_entrepreneurs = 1;
				} else if (arr[j] == "Startups") {
					respJSON.i_startups = 1;
				} else if (arr[j] == "Incubator / Accelerator") {
					respJSON.i_incAccel = 1;
				} else if (arr[j] == "Innovation Community") {
					respJSON.i_innoCommunity = 1;
				} else if (arr[j] == "Venture Capitalist / Angel Investor") {
					respJSON.i_vcAngel = 1;
				} else if (arr[j] == "Makers") {
					respJSON.i_makers = 1;
				}
			}
		}
	}
}
