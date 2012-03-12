exports = module.exports = Color = (function () {
	var vals = {
			red   : '\033[31m',
			green : '\033[32m',
			blue  : '\033[34m',
			cyan  : '\033[36m',
			grey  : '\033[90m',
	    },
	    reset = '\033[0m';

    return function(c, str) {
		return vals[c] + str + reset;
	}
})();