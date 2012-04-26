var optimist = require( 'optimist' );

// Set up arguments options
argv = optimist
		.alias('b', {
			alias: 'browser',
			'default': 'all',
			describe: 'browser(s) to run tests in'
		})
		.boolean('k', {
			alias: 'keep',
			default: false,
			describe: 'keep browser(s) open'
		})
		.argv;

exports.Manager = require('./lib/manager');

exports.listen = function (server, options) {

	var unitTestFiles = [];

	if (argv.b) {
		options.browser = argv.b;
	}

	if (argv.k) {
		options.keepBrowserAlive = true;
	}

	if (argv._.length > 0) {
		unitTestFiles = argv._;
	}

 	return new exports.Manager(server, options, unitTestFiles);
};