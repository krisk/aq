var spawn = require( 'child_process' ).spawn;

exports = module.exports = Browser;

function Browser() {
	var browserSession = null,
		currentBrowserIndex = -1;

	this.currBrowser = function() {
		return this.getBrowsers()[currentBrowserIndex];
	}

	this.hasNext = function() {
		var browsers = this.getBrowsers();
		return currentBrowserIndex < browsers.length - 1;
	}

	this.next = function() {
		currentBrowserIndex++;

		if (browserSession/* && !options.keepBrowserOpen */) {
			browserSession.kill();
		}

		browserSession = spawn('open', ['-a', this.currBrowser().path, 'http://localhost:' + 8001 + '/index.html'] );
	}
}

Browser.prototype.getBrowsers = function() {
	return [
		{ name : 'firefox', path : '/Applications/Firefox.app/Contents/MacOS/firefox' },
		{ name : 'chrome', path : '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome' },
		{ name : 'safari', path : '/Applications/Safari.app/Contents/MacOS/Safari' }
	]
}