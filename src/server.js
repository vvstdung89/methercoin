const Config = require("../config")
const express    = require('express');
const app        = express();

const bodyParser = require('body-parser');
const responseTime = require('response-time');
const errorHandler = require('errorhandler');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());	
app.use(express.static( __dirname + `/../public`));

if (Config.NODE_ENV !== "production"){
	app.use(errorHandler({ dumpExceptions: true, showStack: true }));
} else {
	app.use(errorHandler());
}

var router = express.Router(); 
require('./route.js')(app, router)

if (Config.PORT) {
	var port = Config.PORT
	var tester = createServer(port);
	function createServer(port){
		var tester = app.listen(port)
		.once('error', function (err) {
			if (err.code == 'EADDRINUSE') {
				__Logger.error("Cannot use this port:" +port + ":"+ err.code)
				process.exit(-1)
			}
		})
		.once('listening', function() {
			__Logger.info("Start listening " + port + " ... ");
		});
	}
}

process.on('unhandledRejection', r => console.log(r));