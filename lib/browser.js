var spawn = require( 'child_process' ).spawn;

exports = module.exports = Browser;

var browserSession = null;
function Browser() {
	this.currentBrowserIndex = -1;
}
Browser.prototype.hasNext = function() {
	var browsers = this.getBrowsers();
	return this.currentBrowserIndex < browsers.length - 1;
}
Browser.prototype.next = function() {
	this.currentBrowserIndex++;

	if (browserSession/* && !options.keepBrowserOpen */) {
		browserSession.kill();
	}

	browserSession = spawn('open', ['-a', this.currBrowser().path, 'http://localhost:' + 8001 + '/index.html'] );
}
Browser.prototype.currBrowser = function() {
	return this.getBrowsers()[this.currentBrowserIndex];
}
Browser.prototype.getBrowsers = function() {
	return [
		{ name : 'firefox', path : '/Applications/Firefox.app/Contents/MacOS/firefox' },
		{ name : 'chrome', path : '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome' },
		{ name : 'safari', path : '/Applications/Safari.app/Contents/MacOS/Safari' }
	]
}