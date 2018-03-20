const express    = require('express');
const app        = express();

const bodyParser = require('body-parser');
const responseTime = require('response-time');
const errorHandler = require('errorhandler');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());	
app.use(express.static( __dirname + `/../public`));

if (process.env["NODE_ENV"] !== "production"){
	app.use(errorHandler({ dumpExceptions: true, showStack: true }));
} else {
	app.use(errorHandler());
}

var router = express.Router(); 
require('./route.js')(app, router)

var port = process.env["PORT"] || 10000 
var tester = createServer(port);
function createServer(port){
	var tester = app.listen(port)
	.once('error', function (err) {
		if (err.code == 'EADDRINUSE') {
			console.log("Cannot use this port:" +port + ":"+ err.code)
			process.exit(-1)
		}
	})
	.once('listening', function() {
		console.log("Start listening " + port + " ... ");
	});
}


process.on('unhandledRejection', r => console.log(r));