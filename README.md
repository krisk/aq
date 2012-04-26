Automate QUnit tests

### To run the tests

#### From the test server

	node server.js

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