var path = require( 'path' ),
	url = require( 'url' ),
	util = require( 'util' ),
	fs = require('fs'),
	events = require('events'),
	Color = require('./color'),
	Tester = require('./tester'),
	Browser = require('./browser');

/**
 * Export the constructor.
 */
exports = module.exports = Manager;

function Manager(server, options) {
	var self = this,
		browserManagement,
		io,
		tester;

	events.EventEmitter.call(this);

	this.options = options;

	this._unitTestsDir = null;

	// Request handlers
	server.on('request', function (req, res) {

		var path = url.parse( req.url ).pathname;

		if (url.parse( req.url ).pathname ==='/aq/aq.js' ) {
			fs.readFile(__dirname + '/aq.js', function(error, content) {
				if (error) {
					console.log(error);
				} else {
					res.writeHead(200, { 'Content-Type': 'application/javascript' });
					res.end(content);
				}
			});
		}
	});

	browserManagement = new Browser();

	function onTestExecuting(file) {
		console.log('\nExecuting ' + Color('cyan', file), 'on ' + Color('green', browserManagement.currBrowser().name));

		self.emit('test-executing', file);
	}

	function onTestDone(data) {
		console.log( util.format('total: %s, passed: %s, failed: %s', data.total, data.passed, data.failed ) );

		// Print the failures
		if (data.failed > 0) {
			console.log( Color( 'red', 'Failures:' ) );
			data.failedTests.forEach(function(test, index) {
				console.log(util.format( '(%d) %s: %s, %s: %s, %s: %s', index+1, Color('grey', 'module'), test.module, Color('grey', 'test'), test.name, Color('grey', 'details'), test.message ) );
			});
		}

		self.emit('test-done', data);
	}

	function onDone(data) {
		console.log( '\nTest complete!' );
		console.log( util.format( 'total: %s, passed: %s, failed: %s \n', data.total, data.passed, data.failed ) );

		self.emit('done', data);

		if (browserManagement.hasNext.call(browserManagement)) {
			browserManagement.next.call(browserManagement);
		}
	}

	function onSocketConnection(socket) {
		socket.emit('data', self.getUnitTests());

		tester = new Tester(socket);

		tester
			.on('test-executing', onTestExecuting)
			.on('test-done', onTestDone)
			.on('done', onDone);
	}

	io = require('socket.io').listen(server);
	io.set('log level', -1);
	io.set('transports', ['websocket', 'flashsocket', 'xhr-polling']);
	io.sockets.on( 'connection', onSocketConnection);

	browserManagement.next();
}

// Inherit events.EventEmitter
Manager.prototype = Object.create(events.EventEmitter.prototype);
/**
 * Sets the directory where all the unit tests are located
 */
Manager.prototype.setUnitTestsDir = function(path) {
	this._unitTestsDir = path;
}
/**
 * Returns a list of the unit tests to be run
 */
Manager.prototype.getUnitTests = function() {
	if (!this._unitTestFiles) {
		this._unitTestFiles = fs.readdirSync(this.options.dir || this._unitTestsDir);
	}
	return this._unitTestFiles;
}