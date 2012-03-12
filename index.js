exports.Manager = require('./lib/manager');

exports.listen = function (server, options) {
  return new exports.Manager(server, options);
};