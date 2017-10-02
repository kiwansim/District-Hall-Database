var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var crypto = require('crypto');
var oauth = require('oauth-1.0a');
var request = require('request');
var Connection = require('tedious').Connection;
var ConnectionPool = require('tedious-connection-pool');
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
var poolConfig = {
    min: 6,
    max: 20,
    log: true
};

var connectionConfig = {
    userName: 'dh-admin', 
    password: 'Innovation!',
    server: 'districthall.database.windows.net', 
    port: '1433',
    options: {
      database: 'QueryTesting', 
      encrypt: true
    }
};

//create the pool
var pool = new ConnectionPool(poolConfig, connectionConfig);

/* DATABASE CONNECTION */
/*var config = {
     userName: 'dh-admin', 
     password: 'Innovation!',
     server: 'districthall.database.windows.net', 
     port: '1433',
     options: {
           database: 'QueryTesting', 
           encrypt: true
        }
   }*/

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
  console.log("received a request in /insertdata");
  response.header("Access-Control-Allow-Origin","*");
  response.header("Access-Control-Allow-Headers", "X-Requested-With");

  pool.on('error', function(err) {
    console.error(err);
  });
 
  request.body.results.forEach(function(element, index) {
    pool.acquire(function (err, connection) {
      if (err) {
       console.error(err);
       return;
      } else {
        console.log('Connected to DB');
        console.log(element);
        insertData(element, connection);
      }
    });

    // possibly use this in a callback function
    // when this is inside forEach, errors out with Error: Can't set headers after they are sent.
    //response.send("inserted one row successfully");
  });

  response.send("inserted all rows from one request successfully");

  /*pool.acquire(function (err, connection) {
    if (err) {
      console.error(err);
      return;
    } else {
      console.log('Connected to DB');
      console.log(request.body);
      insertData(request.body, connection);
      //response.send("something");
    }*/

    /*connection.on('connect', function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Connected to DB');
        console.log(request.body);
        insertData(request.body, connection);
        //response.send("something");
      }
    });*/
  //});
//	var connection = new Connection(config);
});

function setStatement() {
  var statement = "INSERT INTO test3 (event_client, b_date, b_timeIn, b_timeOut, b_duration, b_type, b_room, b_numAttendees, b_description, b_notes, f_value, f_usageFee, f_reduction, f_numReduced, f_numInnovation, f_paymentSystem, f_transactionNum, f_datePaid, sp_onMission, sp_npoStartup, sp_publicCalendar, sp_freeAttendance, sect_lifeScience, sect_tech, sect_robotics, sect_education, sect_socialImpact, sect_sustainability, sect_creative, sect_law, sect_financeInsurance, sect_multisector, sect_npo, sect_global, sect_government, sect_community, sect_largeCosOrgs, type_conferenceWorkshop, type_meeting, type_lecturePanel, type_tour, type_hackathon, type_meetup, type_networking, type_social, i_entrepreneurs, i_startups, i_incAccel, i_innoCommunity, i_vcAngel, i_makers) VALUES (@p_evcli, @p_bdate, Cast(@p_btimeIn as Time), Cast(@p_btimeOut as Time), Cast(@p_bdur as Time), @p_btype, @p_broom, @p_bnumA, @p_bdesc, @p_bnote, Cast(@p_fval as Money), Cast(@p_ffee as Money), Cast(@p_freduc as Money), @p_fnumred, @p_fnuminno, @p_fpaysyst, @p_ftransnum, @p_fdatepaid, @p_sponmiss, @p_spnpo, @p_sppubcal, @p_spfree, @p_tyconf, @p_tymeeting, @p_tylec, @p_tytour, @p_tyhack, @p_tymeetup, @p_tynetwo, @p_tysoci, @p_ient, @p_istart, @p_iincacc, @p_innocom, @p_ivc, @p_imakers, @p_seclif, @p_sectech, @p_secrob, @p_seced, @p_secsocimp, @p_secsust, @p_seccreat, @p_seclaw, @p_secfin, @p_secmulti, @p_secnpo, @p_secglob, @p_secgov, @p_seccomm, @p_seclarge)";
  return statement;
}

function insertData(data, connection) {
  var statement = setStatement();
  var current = data;
  request = new Request(statement, function(err, rowCount, rows) {
    if (err) {
      console.log(err + 'error has occured');
    } else {
      console.log(rowCount + 'row(s) inserted');
      connection.release();
    }
  });

  // console.log(current.b_timeIn, current.b_date, current.event_client);
  request.addParameter('p_evcli', TYPES.NVarChar, current.event_client);
  request.addParameter('p_bdate', TYPES.Date, current.b_date);
  request.addParameter('p_btimeIn', TYPES.NVarChar, current.b_timeIn);
  request.addParameter('p_btimeOut', TYPES.NVarChar, current.b_timeOut);
  request.addParameter('p_bdur', TYPES.NVarChar, current.b_duration);
  request.addParameter('p_btype', TYPES.NVarChar, current.b_type);
  request.addParameter('p_broom', TYPES.NVarChar, current.b_room);
  request.addParameter('p_bnumA', TYPES.Int, current.b_numAttendees);
  request.addParameter('p_bdesc', TYPES.NVarChar, current.b_description);
  request.addParameter('p_bnote', TYPES.NVarChar, current.b_notes);
  //console.log(current.f_value, current.f_usageFee, current.f_reduction);
  request.addParameter('p_fval', TYPES.NVarChar, current.f_value);
  request.addParameter('p_ffee', TYPES.NVarChar, current.f_usageFee);
  request.addParameter('p_freduc', TYPES.NVarChar, current.f_reduction);
  request.addParameter('p_fnumred', TYPES.Int, current.f_numReduced);
  request.addParameter('p_fnuminno', TYPES.Int, current.f_numInnovation);
  request.addParameter('p_fpaysyst', TYPES.NVarChar, current.f_paymentSystem);
  request.addParameter('p_ftransnum', TYPES.NVarChar, current.f_transactionNum);
  // change this later if I can figure out how to get the date paid to work
  request.addParameter('p_fdatepaid', TYPES.NVarChar, current.f_datePaid);
 
  request.addParameter('p_sponmiss', TYPES.Int, current.sp_onMission);
  request.addParameter('p_spnpo', TYPES.Int, current.sp_npoStartup);
  request.addParameter('p_sppubcal', TYPES.Int, current.sp_publicCalendar);
  request.addParameter('p_spfree', TYPES.Int, current.sp_freeAttendance);
  request.addParameter('p_tyconf', TYPES.Int, current.type_conferenceWorkshop);
  request.addParameter('p_tymeeting', TYPES.Int, current.type_meeting);
  request.addParameter('p_tylec', TYPES.Int, current.type_lecturePanel);
  request.addParameter('p_tytour', TYPES.Int, current.type_tour);
  request.addParameter('p_tyhack', TYPES.Int, current.type_hackathon);
  request.addParameter('p_tymeetup', TYPES.Int, current.type_meetup);
  request.addParameter('p_tynetwo', TYPES.Int, current.type_networking);
  request.addParameter('p_tysoci', TYPES.Int, current.type_social);
  request.addParameter('p_ient', TYPES.Int, current.i_entrepreneurs);
  request.addParameter('p_istart', TYPES.Int, current.i_startups);
  request.addParameter('p_iincacc', TYPES.Int, current.i_incAccel);
  request.addParameter('p_innocom', TYPES.Int, current.i_innoCommunity);
  request.addParameter('p_ivc', TYPES.Int, current.i_vcAngel);
  request.addParameter('p_imakers', TYPES.Int, current.i_makers);
  request.addParameter('p_seclif', TYPES.Int, current.sect_lifeScience);
  request.addParameter('p_sectech', TYPES.Int, current.sect_tech);
  request.addParameter('p_secrob', TYPES.Int, current.sect_robotics);
  request.addParameter('p_seced', TYPES.Int, current.sect_education);
  request.addParameter('p_secsocimp', TYPES.Int, current.sect_socialImpact);
  request.addParameter('p_secsust', TYPES.Int, current.sect_sustainability);
  request.addParameter('p_seccreat', TYPES.Int, current.sect_creative);
  request.addParameter('p_seclaw', TYPES.Int, current.sect_law);
  request.addParameter('p_secfin', TYPES.Int, current.sect_financeInsurance);
  request.addParameter('p_secmulti', TYPES.Int, current.sect_multisector);
  request.addParameter('p_secnpo', TYPES.Int, current.sect_npo);
  request.addParameter('p_secglob', TYPES.Int, current.sect_global);
  request.addParameter('p_secgov', TYPES.Int, current.sect_government);
  request.addParameter('p_seccomm', TYPES.Int, current.sect_community);
  request.addParameter('p_seclarge', TYPES.Int, current.sect_largeCosOrgs);

  connection.execSql(request); 
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
