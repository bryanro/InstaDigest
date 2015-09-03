#!/bin/env node


var express = require('express');
var http = require('http');
var config = require('./app/config');
var logger = require('winston');

var app = express();

app.set('port', config.port || 3000);

logger.level = config.loggingVerbosity;

logger.info('******************************');
logger.info('******************************');

var server = app.listen(app.get('port'), function() {
    logger.info('Express server listening on port ' + server.address().port);
});

require('./app/express-settings')(app);
require('./app/server/express-routes')(app);

// initialize the scheduler
require('./app/server/controllers/scheduler');

module.exports = app;