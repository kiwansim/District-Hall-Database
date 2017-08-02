var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var crypto = require('crypto');
var oauth = require('oauth-1.0a');
var request = require('request');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

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
var connection = new Connection(config);

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
	//console.log(req.body);
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

app.post('/insertdata', function(request, response) {
	console.log("received a request in /insertdata");
	//console.log(request.body.event);
	response.header("Access-Control-Allow-Origin","*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
	var name = request.body.event;
	connection.on('connect', function(err) {
  	  if (err) {
   	    console.log(err)
  	  } else {
        console.log('Connected to DB');
        //var name = "HOLD for testing";
        var date = "2017-09-04";
        insertData(name, date);
        response.send("something");
      }
    });
});

function insertData(name, date) {
	console.log("Inserting '" + name + "' into Table...");

    request = new Request(
        'INSERT INTO test (event_client, b_date) OUTPUT INSERTED.Id VALUES (@event_client, @date);',
        function(err, rowCount, rows) {
        if (err) {
            callback(err);
        } else {
            console.log(rowCount + ' row(s) inserted');
            //callback(null, 'Nikita', 'United States');
        }
        });
    request.addParameter('event_client', TYPES.NVarChar, name);
    request.addParameter('b_date', TYPES.Date, date);

    // Execute SQL statement
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
