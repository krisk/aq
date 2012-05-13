[![Build Status](https://secure.travis-ci.org/krisk/aq.png?branch=master)](http://travis-ci.org/krisk/aq)

# AQ

## What is it?

(Note: this is still a work in progress. Nonetheless, the base functioality is there, and works)

AQ allows you to automate your QUnit tests, leveraging Node.js.

To get started, create a Node.js server.

## Install

Using npm:

`npm install aq`

Update the packages:

`npm update`

In your `server.js`,

```javascript
aq = require('aq'),

app = http.createServer( function( request, response ) {
	// ..whatever you use to serve content
} ).listen( port );

// AQ options
var options = {
		// Display test results on the terminal
		log: true,

		// Name of the folder where the unit test files reside
		testFolder: 'unit-tests',

		// Directory
		dir: path.normalize(__dirname + '/test/unit-tests/'),

		// The test page
		page: '/test/index.html'
	};

// Let AQ listen to the server
aq = aq.listen(app, options);
```

## Creating the tests

### The test page

Before you can automate your tests, you first need a page where the tests can run in.

In your test page (perhaps index.html), include AQ and socket.io:

```html
<script src="/socket.io/socket.io.js"></script>
<script src="/aq/aq.js"></script>
```

Additionally, there has to be a target container called `aq-container` where AQ can load the proper unit test into.

```html
<div id="aq-container"></div>
```

AQ will begin testing only when explicitly told.  You can do this by calling `AQ.start()`, in the test page:

```javascript
window.AQ.start();
```

### Struture of a Unit Test file

Each unit test file within the unit test filder should be an HTML file containing a global `run` function.  This function **must** exist so the test harness can execute the tests defined therein properly.

```html
<!-- Maybe some DOM here -->
<script>
    // global function needed by AQ
	function run() {

		// All QUnit tests, modules, etc.. go here.
		test('some test', function() {
			ok(true, 'always true');
		}

	}
</script>
```

### How does it all work?

When the server starts, AQ scans the specified directory where the unit tests are contained.  Each file name is then returned to the client side.  The content of each test file is loaded via an AJAX request, and inserted into `aq-container`.  Once iserted, the `run` function is called, and the tests are executed.  Upon completion of the tests, the next unit test file is loaded.

All tests results (and final results) are passed to the server.

## Running the tests

### Run all tests in the unit test folder

`node server.js`

### Command line options:

#### Specify the browser

By default, the unit tests will run on all the browsers specified in `config.js`.  To specify the browser, you can use the `-b` option

`node server.js -b chrome`

#### Keep browser open

By default, after all the unit tests have completed running on a browser, that browser session will close.  You can choose to keep the browser open with the `-k` option

`node server.js -k true`

#### How to specify which unit tests to run

Insert the unit tests to run after `--`

`node server.js -- test1.html test2.html`

## Events

### On the client

AQ provides a `beforeTestRun` event which is executed after a unit test file is loaded.  If this is event is bound, **no test will run unless an explicit call to `AQ.run` is made.**  For example, in the test page:

```javascript
window.AQ.start();

$(window.AQ).on('beforeTestRun', function() {
	// .. do some setup before the test
	window.AQ.run(); // Run the tests
});
```

### On the server

On the server side, once AQ is listening, you can bind onto certain events:

```javascript
aq = aq.listen(app, options);

/**
* Triggers when a new unit test file is executing
*
* @param filename {String} name of the file
*/
aq.on('test-executing', function(filename) {
	console.log(filename);
});

/**
* Triggers when a file containing unit tests has completed
*
* @param data {Object} object literal containing:
*
* 	failed: {Int} - number of tests that failed
*	passed: {Int} - number of tests that passed
*	total: {Int} -  number of tests run
*	details: {Array} - list of all tests that failed and their details
*/
aq.on('test-done', function(data) {
	console.log(data);
});

/**
* Triggers when all the unit test files have been executed
*
* @param data {Object} object literal containing:
*
* 	failed: {Int} - number of tests that failed
*	passed: {Int} - number of tests that passed
*	total: {Int} - number of tests run
*/
aq.on('done', function(data) {
	console.log(data);
});
```