/**
 * Manage unit testing
 * @version 1.0.2
 */
(function ($, window) {

	$(function() {

		function Tester() {
			var socket = io.connect('http://localhost'),

				self = this,
				$self = $(self),

				failedTests = [],		// List of all unit tests that have failed
				currTest = {}, 			// Keeps track of the current test runing
				directory = '',			// Directory of where the unit tests are located
				unitTestFilenames = [], // List of all the unit tests

				currentIndex = -1,		// Index of the current unit test

				started = false,
				isReady = false,

				currUnitTestFilename,

				$BODY  = $(window.document.body),
				$AQ_CONTAINER  = $('#aq-container');  // Container for the tests

			function runUnitTestFile(unitTestFileName) {
				socket.emit('test-executing', unitTestFileName);
				run();
				QUnit.start();
			}

			function onTestFileLoaded() {
				var events = $self.data('events');
				if (events && events['beforeTestRun']) {
					$self.trigger('beforeTestRun');
				} else {
					self.run();
				}
			}

			function loadNextUnitTestFile() {
				currentIndex++;
				currUnitTestFilename = unitTestFilenames[currentIndex];

				clear();

				$AQ_CONTAINER.load(directory + '/' + currUnitTestFilename, onTestFileLoaded);
			}

			// Triggers whenever an assertion is run
			function onLog(obj) {
				if (!obj.result) {
					currTest.message = obj.message;
					failedTests.push(currTest);
				}
			}

			// Triggers when a set of assertions in a given test is done
			function onTestDone(obj) {
				if (obj.failed > 0) {
					currTest.module = obj.module;
					currTest.name = obj.name;
				}
			}

			// Triggers when the entire unit test is done
			function unitTestDone(obj) {
				var result = {
					file: unitTestFilenames[currentIndex-1],
					failed: obj.failed,
					passed: obj.passed,
					runTime: obj.runTime,
					total: obj.total,
					failedTests: failedTests
				};

				socket.emit('test-done', result);
				failedTests = [];

				if (currentIndex === unitTestFilenames.length - 1) {
					socket.emit('done', result);
					return;
				}

				loadNextUnitTestFile();
			}

			function configureQUnit() {
				QUnit.config.autostart = false;
				QUnit.log(onLog);
				QUnit.testDone(onTestDone);
				QUnit.done(unitTestDone);
			}

			// Clears the container, and resets QUnit, in preparation
			// for the next test
			function clear() {
				$AQ_CONTAINER.html('');
				QUnit.reset();
				QUnit.init();
			};

			/**
			* Initialize the test harness
			* @param {Array} $tests A collection of test files
			*/
			function init(dir, filenames) {
				configureQUnit();
				directory = dir;
				unitTestFilenames = filenames;
			};


			this.run = function() {
				runUnitTestFile(currUnitTestFilename);
			}

			this.start = function() {
				started = true;
				if (isReady) {
					loadNextUnitTestFile();
				}
			}

			// Once a socket connect is established, the unit tests filenames are passed in via a 'data'
			// call.
			socket.on('data', function (data) {
				init(data.dir, data.filenames);
				isReady = true;
				if (started) {
					self.start();
				}
			});

		};

		window.AQ = new Tester();

	});

})(jQuery, window);