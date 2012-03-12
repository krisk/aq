var events = require('events');

exports = module.exports = Tester;

/**
 * Tester framework
 */
function Tester(server) {
	events.EventEmitter.call(this);

	var self = this;
	this.server = server;
	this.filesLeft = 0;
	this.unitTestResult = null;

	this.events = [];

	this.reset();
	
	this.io = require('socket.io').listen(this.server);
	this.io.set('log level', -1);
}

// Inherit events.EventEmitter
Tester.prototype = Object.create(events.EventEmitter.prototype);

Tester.prototype.start = function(unitTests) {
	var self = this;
	this.io.sockets.on( 'connection', function(socket) {
		self.filesLeft = unitTests.length;
		socket.on('executing', function(file) {
			self.onUnitTestExecuting.call(self, file);
		});
		socket.on('done', function(data) {
			self.onUnitTestComplete.call(self, data);
		});
	});
}

Tester.prototype.reset = function() {
	this.unitTestResult = {
		failed: 0,
		passed: 0,
		total: 0,
		details: []
	};
}

Tester.prototype.onUnitTestExecuting = function(file) {
	this.emit('test-executing', file);
}

Tester.prototype.onUnitTestComplete = function(data) {

	// Increment the test result values
	this.unitTestResult.failed += data.failed;
	this.unitTestResult.passed += data.passed;
	this.unitTestResult.total += data.total;

	this.emit('test-done', data);

	this.filesLeft--;

	if (this.filesLeft === 0) {
		this.emit('done', this.unitTestResult);
		this.reset();
	}
}