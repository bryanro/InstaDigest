#!/bin/env node
// OpenShift sample Node application
var express = require('express');
var mongoose = require('mongoose');
var fs      = require('fs');
var path    = require('path');
var application_root = __dirname;
var logger = require('./app/server/modules/logger');
var mongoStore = require('connect-mongo')(express);

console.log('***************');
console.log('***************');

/**
 * Define the sample application.
 */
var InstaDigest = function() {

    // Scope.
    var self = this;

    /* ================================================================ */
    /* Helper functions. */
    /* ================================================================ */

    /**
	 * Set up server IP address and port # using env variables/defaults.
	 */
    self.setupVariables = function() {
        // Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 3000;

        if (typeof self.ipaddress === "undefined") {
            logger.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1', 'server.js');
            self.ipaddress = "127.0.0.1";
        };
    };

    /**
	 * terminator === the termination handler Terminate server on receipt of the
	 * specified signal.
	 * 
	 * @param {string}
	 *            sig Signal to terminate on.
	 */
    self.terminator = function (sig) {
        if (typeof sig === "string") {
            logger.warn('Received ' + sig + ' - terminating application', 'server.js');
            process.exit(1);
        }
        logger.warn('Node server stopped', 'server.js');
    };


    /**
	 * Setup termination handlers (for exit and a list of signals).
	 */
    self.setupTerminationHandlers = function(){
        // Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /* ================================================================ */
    /* App server functions (main app logic here). */
    /* ================================================================ */

    /**
	 * Initialize the server (express) and create the routes and register the
	 * handlers.
	 */
    self.initializeServer = function() {
        var env = 'development';
        if (typeof process.env.OPENSHIFT_APP_NAME != 'undefined') {
            switch (process.env.OPENSHIFT_APP_NAME) {
                case 'beta':
                    env = 'beta';
                    break;
                case 'prod':
                    env = 'production';
                    break;
            }
        }
        else {
            env = 'development';
        }
        logger.info('Environment: ' + env, 'server.js');

        self.app = express();
        self.app.config = require('./app/config')[env];

        // set logging verbosity level
        logger.setVerbosity(self.app.config.verbosityLevel);

        // connect to mongodb using config's connection info
        self.app.mongooseConnection = mongoose.connect(self.app.config.mongoConn, function(err){
            if (err){
                logger.error('Error connecting to mongoose database (' + self.app.config.mongoConn + '): ' + err, 'server.js');
            }
            else {
                logger.info('Successfully connected to mongoose', 'server.js');
            }
        });

        module.exports.app = self.app;

        // Bootstrap models
        var modelsPath = __dirname + '/app/server/models';
        var modelFiles = fs.readdirSync(modelsPath);
        modelFiles.forEach(function (file) {
            require(modelsPath + '/' + file)
        });

        //var authCheck = require('./app/server/modules/auth');

        self.app.configure(function () {
            self.app.set('views', __dirname + '/app/server/views');
            self.app.set('view engine', 'jade');
            //app.use(express.logger({ format: ':method :url' })),
            self.app.use(express.cookieParser()),
            self.app.use(express.bodyParser({ uploadDir: __dirname + '/app/upload' })),
            self.app.use(express.session({
                store: new mongoStore({
                    url: self.app.config.mongoConn
                }),
                secret: '!!!InstaDailyDigest!!!',
                cookie: {
                    maxAge: self.app.config.sessionExpiration
                }
            }));
            //self.app.use(authCheck),
            self.app.use(self.app.router),
            self.app.use(express.static(__dirname + '/app/public')),
            self.app.use(express.errorHandler());
        });

        // initialize the routes
        require('./app/server/routes')(self.app);
    };


    /**
	 * Initializes the application.
	 */
    self.initialize = function() {
        self.setupVariables();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
	 * Start the server (starts up the application).
	 */
    self.start = function() {
        // Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            logger.info('Node server started: ' + self.ipaddress + ':' + self.port, 'server.js');
        });

        var scheduler = require('./app/server/controllers/scheduler');
    };
};



/**
 * main(): Main code.
 */
var instaDigestApp = new InstaDigest();
instaDigestApp .initialize();
instaDigestApp .start();