/**
 * Manage unit testing
 * @version 1.0.2
 */

var a1 = ['a', 'b', 'c'];
var a2 = [0, 1, 2, ['3a', '3b', '3c', ['a', 'c']], 4];

function collapse(a) {
    var result = [];
    for(var i = 0; i < a.length; i ++){
        if(a[i] instanceof Array){
            result = result.concat(collapse(a[i]));
        }else{
            result.push(a[i]);
        }
    }

    return result;
};

var a = collapse(a2);
console.log('array', a);


(function ($, window) {

	$(function() {

		new (function Tester() {
			var socket = io.connect('http://localhost'),

				self = this,

				failedTests = [],		// List of all unit tests that have failed
				currTest = {}, 			// Keeps track of the current test runing
				directory = '',			// Directory of where the unit tests are located
				unitTestFilenames = [], // List of all the unit tests

				currentIndex = -1,		// Index of the current unit test

				$BODY  = $(window.document.body),
				$AQ_CONTAINER  = $('#aq-container');  // Container for the tests

			function runUnitTestFile(unitTestFileName) {
				socket.emit('test-executing', unitTestFileName);
				run();
				QUnit.start();
			}

			function loadNextUnitTestFile() {
				currentIndex++;
				var unitTestFileName = unitTestFilenames[currentIndex];

				self.clear();

				$AQ_CONTAINER
					.load(directory + '/' + unitTestFileName, function () {
						runUnitTestFile(unitTestFileName);
					});
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
			this.clear = function() {
				$AQ_CONTAINER.html('');
				QUnit.reset();
				QUnit.init();
			};

			/**
			* Initialize the test harness
			* @param {Array} $tests A collection of test files
			*/
			this.init = function(dir, filenames) {
				configureQUnit();
				directory = dir;
				unitTestFilenames = filenames;
				loadNextUnitTestFile();
			};

			// Once a socket connect is established, the unit tests filenames are passed in via a 'data'
			// call.
			socket.on('data', function (data) {
			  console.log(data);
			  self.init(data.dir, data.filenames);
			});

		})();

	});

})(jQuery, window);