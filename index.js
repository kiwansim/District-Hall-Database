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
     options: {
           database: 'QueryTesting' 
           , encrypt: true
        }
   }
var connection = new Connection(config);
console.log(config);

app.get('/', function(request, response) {
  response.render('public/index.html');
});

app.post('/query', function(req, response) {
	console.log("received a request in /query");
	response.header("Access-Control-Allow-Origin","*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
	//console.log(req.body);
	//location_ids=4520 is district hall
	var url = req.body.url + '&location_ids=4520'+ '&event_start_date=' + req.body.event_start_date + '&event_end_date=' + req.body.event_end_date;
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



// Attempt to connect and execute queries if connection goes through
/*connection.on('connect', function(err) {
    if (err) {
          console.log(err)
    } else {
           queryDatabase()
    }
});

function queryDatabase()
   { console.log('Reading rows from the Table...');

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
   }*/
