var path = require( 'path' ),
	url = require( 'url' ),
	util = require( 'util' ),
	spawn = require( 'child_process' ).spawn,
	fs = require('fs'),
	events = require('events'),

	Color = require('./color'),
	Tester = require('./tester');

/**
 * Export the constructor.
 */
exports = module.exports = Manager;

function Manager(server, options) {
	var self = this;

	this.options = options;

	this._unitTestsDir = null;

	// Request handlers
	server.on('request', function (req, res) {
		var path = url.parse( req.url ).pathname;

		switch (path) {
			case '/aq/aq.js':
				fs.readFile(__dirname + '/aq.js', function(error, content) {
					if (error) {
						console.log(error);
					} else {
						res.writeHead(200, { 'Content-Type': 'application/javascript' });
						res.end(content);
					}
				});
				break;
			case '/start':
				var unitTests = self.getUnitTests();
				self.tester.start(unitTests);

				res.writeHead(200, { 'Content-type': 'application.json '});
				res.write(JSON.stringify(unitTests));
				res.end();
				break;
		}
	});

	this.tester = new Tester(server);

	this.tester.on('test-executing', function() {
		self.onTestExecuting.apply(self, arguments)
	});

	this.tester.on('test-done', function() {
		self.onTestDone.apply(self, arguments);
	});

	this.tester.on('done', function() {
		self.onDone.apply(self, arguments);
	});
}

// Inherit events.EventEmitter
Manager.prototype = Object.create(events.EventEmitter.prototype);

/**
 * Triggers when a file contained unit tests is to be executed
 *
 * @param {String} file to be executed
 * @api private
 */
Manager.prototype.onTestExecuting = function(file) {
	if (this.options.log) {
		console.log('\nExecuting ' + Color('cyan', file));
	}
	this.emit('test-executing', file)
}

/**
 * Triggers when a file containing unit tests has finished
 *
 * @param {Object} data contains the test result: total, passed, failed
 * @api private
 */
Manager.prototype.onTestDone = function(data) {
	if (this.options.log) {
		console.log( util.format('total: %s, passed: %s, failed: %s', data.total, data.passed, data.failed ) );

		// Print the failures
		if (data.failed > 0) {
			console.log( Color( 'red', 'Failures:' ) );
			data.failedTests.forEach(function(test, index) {
				console.log(util.format( '(%d) %s: %s, %s: %s, %s: %s', index+1, Color('grey', 'module'), test.module, Color('grey', 'test'), test.name, Color('grey', 'details'), test.message ) );
			});	
		}
	}

	this.emit('test-done', data);
}

/**
 * Triggers when all the files containing unit tests have finished
 *
 * @param {Object} data contains the test result: total, passed, failed
 * @api private
 */
Manager.prototype.onDone = function(data) {
	if (this.options.log) {
		console.log( '\nTest complete!' );
		console.log( util.format( 'total: %s, passed: %s, failed: %s \n', data.total, data.passed, data.failed ) );
	}

	this.emit('done', data);
}

/**
 * Sets the directory where all the unit tests are located
 *
 * @param {String} directory
 * @api private
 */
Manager.prototype.setUnitTestsDir = function(path) {
	this._unitTestsDir = path;
}

/**
 * Returns a list of the unit tests to be run
 *
 * @return {Array} unit test files
 * @api public
 */
Manager.prototype.getUnitTests = function() {
	if (!this._unitTestFiles) {
		this._unitTestFiles = fs.readdirSync(this.options.dir || this._unitTestsDir);
	}
	return this._unitTestFiles;
}

Manager.prototype.start = function() {
	//this.tester.startNextBrowserSession();
}