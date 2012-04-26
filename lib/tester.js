var events = require('events');

exports = module.exports = Tester;

function Tester(socket) {
	events.EventEmitter.call(this);

	var self = this,
		filesLeft = 0,
		unitTestResult = null;

	/**
	 * Triggers when a file containing unit tests is to be executed
	 *
	 * @param {String} file to be executed
	 * @api private
	 */
	function onTestExecuting(file) {
		this.emit('test-executing', file);
	}

	/**
	 * Triggers when a file containing unit tests has finished
	 *
	 * @param {Object} data contains the test result: total, passed, failed
	 * @api private
	 */
	function onTestDone(data) {
		// Increment the test result values
		unitTestResult.failed += data.failed;
		unitTestResult.passed += data.passed;
		unitTestResult.total += data.total;

		this.emit('test-done', data);
	}

	/**
	 * Triggers when all the files containing unit tests have finished
	 *
	 * @api private
	 */
	function onDone() {
		this.emit('done', unitTestResult);
		this.reset();
	}

	socket
		.on('test-executing', onTestExecuting.bind(this))
		.on('test-done', onTestDone.bind(this))
		.on('done', onDone.bind(this));

	this.reset = function() {
		unitTestResult = {
			failed: 0,
			passed: 0,
			total: 0,
			details: []
		}
	}

	this.reset();
}

Tester.prototype = Object.create(events.EventEmitter.prototype);