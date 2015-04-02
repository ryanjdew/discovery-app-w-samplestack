var app = angular.module('ml.utils',[]);

require('./maps.js')(app);
require('./loader.js')(app);
require('./filters.js')(app);

exports.module = app;