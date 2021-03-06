var spawn = require( 'child_process' ).spawn;

exports = module.exports = Browser;

function Browser(port, browsersToUse, page) {
	var browserSession = null,
		currentBrowserIndex = -1,
		browsersMap = {},
		browsers = [];

	if (!browsersToUse) {
		this.getBrowsers().forEach(function(browser, index) {
			browsers.push(browser);
		});
	} else {
		// Create a browser map, name => browser, for easy retrieval
		this.getBrowsers().forEach(function(browser, index) {
			browsersMap[browser.name] = browser;
		});

		// Load each browser
		browsersToUse.forEach(function(browser, index) {
			browsers.push(browsersMap[browser]);
		});
	}

	this.currBrowser = function() {
		return browsers[currentBrowserIndex];
	}

	this.hasNext = function() {
		return currentBrowserIndex < browsers.length - 1;
	}

	this.next = function() {
		currentBrowserIndex++;

		if (browserSession/* && !options.keepBrowserOpen */) {
			browserSession.kill();
		}

		browserSession = spawn('open', ['-a', this.currBrowser().path, 'http://localhost:' + port + page] );
	}
}

Browser.prototype.getBrowsers = function() {
	return [
		{ name : 'firefox', path : '/Applications/Firefox.app/Contents/MacOS/firefox' },
		{ name : 'chrome', path : '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome' },
		{ name : 'safari', path : '/Applications/Safari.app/Contents/MacOS/Safari' }
	]
}