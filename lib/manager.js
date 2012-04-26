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
		tester,
		unitTestsDir = null,
		unitTestFiles = null;

	events.EventEmitter.call(this);

	function onTestExecuting(file) {
		console.log('\nExecuting ' + Color('cyan', file), 'on ' + Color('green', browserManagement.currBrowser().name));

		this.emit('test-executing', file);
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

		this.emit('test-done', data);
	}

	function onDone(data) {
		console.log( '\nTest complete!' );
		console.log( util.format( 'total: %s, passed: %s, failed: %s \n', data.total, data.passed, data.failed ) );

		this.emit('done', data);

		if (browserManagement.hasNext.call(browserManagement)) {
			browserManagement.next.call(browserManagement);
		}
	}

	function onSocketConnection(socket) {
		socket.emit('data', {
			dir: options.testFolder,
			filenames: this.getUnitTests()
		});

		tester = new Tester(socket);

		tester
			.on('test-executing', onTestExecuting.bind(this))
			.on('test-done', onTestDone.bind(this))
			.on('done', onDone.bind(this));
	}

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

	/**
	 * Sets the directory where all the unit tests are located
	 */
	this.setUnitTestsDir = function(path) {
		unitTestsDir = path;
	}

	/**
	 * Returns a list of the unit tests to be run
	 */
	this.getUnitTests = function() {
		if (!unitTestFiles) {
			unitTestFiles = fs.readdirSync(options.dir || unitTestsDir);
		}
		return unitTestFiles;
	}

	io = require('socket.io').listen(server);
	io.set('log level', -1);
	io.set('transports', ['websocket', 'flashsocket', 'xhr-polling']);
	io.sockets.on( 'connection', onSocketConnection.bind(this));

	browserManagement = new Browser();
	browserManagement.next();
}

// Inherit events.EventEmitter
Manager.prototype = Object.create(events.EventEmitter.prototype);