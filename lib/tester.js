var events = require('events');

exports = module.exports = Tester;

function Tester(socket) {
	events.EventEmitter.call(this);

	var self = this;

	this.filesLeft = 0;
	this.unitTestResult = null;
	this.events = [];
	this.reset();

	socket
		.on('test-executing', function(file) {
			self.onTestExecuting.call(self, file);
		})
		.on('test-done', function(data) {
			self.onTestDone.call(self, data);
		})
		.on('done', function(data) {
			self.onDone.call(self, data);
		});
}

Tester.prototype = Object.create(events.EventEmitter.prototype);

Tester.prototype.reset = function() {
	this.unitTestResult = {
		failed: 0,
		passed: 0,
		total: 0,
		details: []
	};
}

/**
 * Triggers when a file containing unit tests is to be executed
 *
 * @param {String} file to be executed
 * @api private
 */
Tester.prototype.onTestExecuting = function(file) {
	this.emit('test-executing', file);
}

/**
 * Triggers when a file containing unit tests has finished
 *
 * @param {Object} data contains the test result: total, passed, failed
 * @api private
 */
Tester.prototype.onTestDone = function(data) {
	// Increment the test result values
	this.unitTestResult.failed += data.failed;
	this.unitTestResult.passed += data.passed;
	this.unitTestResult.total += data.total;

	this.emit('test-done', data);
}

/**
 * Triggers when all the files containing unit tests have finished
 *
 * @param {Object} data contains the test result: total, passed, failed
 * @api private
 */
Tester.prototype.onDone = function(data) {
	this.emit('done', this.unitTestResult);
	this.reset();
}