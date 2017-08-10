var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var crypto = require('crypto');
var oauth = require('oauth-1.0a');
var request = require('request');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));

app.set('port', (process.env.PORT || 5000));
// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

/* ------------------------- OAUTH TRIPLESEAT API -------------------------- */

key = 'xyN9XT5pAFs2lApMvMVvmQTqlFyxGAyVoqBr6Mgo';
secret = '5JazJmt6EOUnrsqlG2eAF5HbAbkJpGPpufPeAKh5';

var tripleseat = oauth({
	consumer: {
		key: key,
		secret: secret
	},
	signature_method: 'HMAC-SHA1',
	hash_function: function(base, key) {
		return crypto.createHmac('sha1', key).update(base).digest('base64');
	}
});
/* ------------------------------------------------------------------------- */

/* DATABASE CONNECTION */
var config = {
     userName: 'dh-admin', 
     password: 'Innovation!',
     server: 'districthall.database.windows.net', 
     port: '1433',
     options: {
           database: 'QueryTesting', 
           encrypt: true
        }
   }

/* When uncommented, 'Connected to DB' prints to Terminal */
/*connection.on('connect', function(err) {
  	  if (err) {
   	    console.log(err)
  	  } else {
        console.log('Connected to DB');
 		queryDatabase();
      }
});*/

app.get('/', function(request, response) {
  response.render('public/index.html');
});

app.post('/query', function(req, response) {
	console.log("received a request in /query");
	response.header("Access-Control-Allow-Origin","*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
	//location_ids=4520 is district hall
	var url = req.body.url + '&location_ids=4520'+ '&sort_direction=asc&order=event_start' + '&event_start_date=' + req.body.event_start_date + '&event_end_date=' + req.body.event_end_date;
	console.log(url);
	var request_data = {
		url: url,
		method: 'GET'
	};
	request({
		url: request_data.url,
		method: request_data.method,
		headers: tripleseat.toHeader(tripleseat.authorize(request_data))
		}, function(err, res, event) {
			if(err) {
				console.log('An error occurred processing the request:');
				console.log(err);
				return;
			}
		var data = JSON.parse(event);
		response.json(data);
	});
});

app.post('/account', function(req, response) {
  console.log("received a request in /account");
  response.header("Access-Control-Allow-Origin","*");
  response.header("Access-Control-Allow-Headers", "X-Requested-With");
  var url = req.body.url;
  var request_data = {
    url: url,
    method: 'GET'
  };
  request({
    url: request_data.url,
    method: request_data.method,
    headers: tripleseat.toHeader(tripleseat.authorize(request_data))
    }, function(err, res, account) {
      if(err) {
        console.log('An error occurred processing the request:');
        console.log(err);
        return;
      }
    var data = JSON.parse(account);
    response.json(account);
  });
});

app.post('/insertdata', function(request, response) {
	var connection = new Connection(config);
	console.log("received a request in /insertdata");
	//console.log(request.body);
	response.header("Access-Control-Allow-Origin","*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");

	connection.on('connect', function(err) {
  	  if (err) {
   	    console.log(err)
  	  } else {
        console.log('Connected to DB');
       console.log('in server this is what the request body looks like' + request.body);
        console.log(request.body);  // returns [object, Object], cannot be passed into JSON.parse
        var temp = JSON.stringify(request.body); // prints {"{\"results\":":{"{\"event_name\":\"name1\",\"event_date\":\"date1\"},{\"event_name\":\"name2\",\"event_date\":\"date2\"}":""}}
        var temp2 = JSON.parse(temp); // prints { '{"results":': { '{"event_name":"name1","event_date":"date1"},{"event_name":"name2","event_date":"date2"}': '' } }
        console.log(temp);
        console.log(temp2);
        //insertData(request.body, connection);
        //response.send("something");
      }
    });
});

function setStatement(data) {
  console.log("in set statement" + data);
}

function insertData(data, connection) {
  //var events = JSON.stringify(data);
  //var events2 = JSON.parse(events)
  console.log("in insert data" + data);
  console.log("NEW STUFF HERE ---------------------------------------");
  console.log(data.results);
  var temp = JSON.stringify(data);
  var temp2 = JSON.parse(temp);
  console.log(temp);
  console.log(temp2); 
  //console.log(temp2.results)

 /* for (var i = 0; i < events.results.length; i++) {
    var current = events.results[i];
    var statement = setStatement(current);*/
    /*request = new Request(statement, function(err, rowCount, rows) {
      if (err) {
        console.log(err + 'error has occured');
      } else {
        console.log(rowCount + 'row(s) inserted');
      }
    });

    request.addParameter('p_eventclient', TYPES.NVarChar, current.event_client);
    request.addParameter('p_bdate', TYPES.Date, current.b_date);
    request.addParameter('p_btimeIn', TYPES.Time, current.b_timeIn);
    request.addParameter('p_btimeOut', TYPES.Time, current.b_timeOut);
    request.addParameter('p_bdur', TYPES.Time, current.b_duration);
    request.addParameter('p_btype', TYPES.NVarChar, current.b_type);
    request.addParameter('p_broom', TYPES.NVarChar, current.b_room);
    request.addParameter('p_bnumA', TYPES.Int, current.b_numAttendees);
    request.addParameter('p_bdesc', TYPES.NVarChar, current.b_description);
    request.addParameter('p_bnote', TYPES.NVarChar, current.b_notes);

    connection.execSql(request);*/

   /* "f_value": "?",
    "f_usageFee": "?",
    "f_reduction": "?",
    "f_numReduced": 0,
    "f_numInnovation": 0,
    "f_paymentSystem": "--",
    "f_transactionNum": "--",
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
    "sect_largeCosOrgs": 0*/
  //}
	/*console.log("Inserting '" + name + "' into Table...");
	// 'INSERT INTO test (event_client, b_date) OUTPUT INSERTED.Id VALUES (@e, @d);'

    request = new Request("INSERT INTO test2 (event_client, b_date) VALUES (@e, @d)",
        function(err, rowCount, rows) {
        if (err) {
            callback(err);
        } else {
            console.log(rowCount + ' row(s) inserted');
            //callback(null, 'Nikita', 'United States');
        }
        });
    request.addParameter('e', TYPES.NVarChar, name);
    request.addParameter('d', TYPES.Date, date);

    // Execute SQL statement
    connection.execSql(request);*/
}

function Start(callback) {
    console.log('Starting...');
    callback(null, 'Jake', 'United States');
}

function Insert(name, location, callback) {
    console.log("Inserting '" + name + "' into Table...");

    request = new Request(
        'INSERT INTO test (Name, Location) OUTPUT INSERTED.Id VALUES (@Name, @Location);',
        function(err, rowCount, rows) {
        if (err) {
            callback(err);
        } else {
            console.log(rowCount + ' row(s) inserted');
            callback(null, 'Nikita', 'United States');
        }
        });
    request.addParameter('Name', TYPES.NVarChar, name);
    request.addParameter('Location', TYPES.NVarChar, location);

    // Execute SQL statement
    connection.execSql(request);
}

function Update(name, location, callback) {
    console.log("Updating Location to '" + location + "' for '" + name + "'...");

    // Update the employee record requested
    request = new Request(
    'UPDATE TestSchema.Employees SET Location=@Location WHERE Name = @Name;',
    function(err, rowCount, rows) {
        if (err) {
        callback(err);
        } else {
        console.log(rowCount + ' row(s) updated');
        callback(null, 'Jared');
        }
    });
    request.addParameter('Name', TYPES.NVarChar, name);
    request.addParameter('Location', TYPES.NVarChar, location);

    // Execute SQL statement
    connection.execSql(request);
}

function Delete(name, callback) {
    console.log("Deleting '" + name + "' from Table...");

    // Delete the employee record requested
    request = new Request(
        'DELETE FROM TestSchema.Employees WHERE Name = @Name;',
        function(err, rowCount, rows) {
        if (err) {
            callback(err);
        } else {
            console.log(rowCount + ' row(s) deleted');
            callback(null);
        }
        });
    request.addParameter('Name', TYPES.NVarChar, name);

    // Execute SQL statement
    connection.execSql(request);
}

function Read(callback) {
    console.log('Reading rows from the Table...');

    // Read all rows from table
    request = new Request(
    'SELECT Id, Name, Location FROM TestSchema.Employees;',
    function(err, rowCount, rows) {
    if (err) {
        callback(err);
    } else {
        console.log(rowCount + ' row(s) returned');
        callback(null);
    }
    });

    // Print the rows read
    var result = "";
    request.on('row', function(columns) {
        columns.forEach(function(column) {
            if (column.value === null) {
                console.log('NULL');
            } else {
                result += column.value + " ";
            }
        });
        console.log(result);
        result = "";
    });

    // Execute SQL statement
    connection.execSql(request);
}

function Complete(err, result) {
    if (err) {
        callback(err);
    } else {
        console.log("Done!");
    }
}

function queryDatabase()
   { console.log('Reading rows from the Table...');

   	request = new Request('UPDATE');
       // Read all rows from table
     request = new Request(
     		'select * from test',
             function(err, rowCount, rows) 
                {
                    console.log(rowCount + ' row(s) returned');
                    process.exit();
                }
            );

     request.on('row', function(columns) {
        columns.forEach(function(column) {
            console.log("%s\t%s", column.metadata.colName, column.value);
         });
             });
     connection.execSql(request);
   }
