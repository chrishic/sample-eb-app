/*!
 * Sample Elastic Beanstalk App with MySQL
 * ---------------------------------------
 * Server creation & initialization.
 */

'use strict';

const assert = require('assert'),
    http = require('http'),
    CONF = require('config'),
    _ = require('lodash'),
    express = require('express'),
    helmet = require('helmet'),
    logger = require('./lib/logger'),
    pkg = require('./package.json'),
    express_log = require('./lib/log-request'),
    ApiUtils = require('./lib/api-helpers'),
    ServiceError = require('./lib/errors');


/////////////////////////////////////////////
//  Constants
/////////////////////////////////////////////

const SHUTDOWN_DELAY_IN_MS = 2000;

const MILLISECONDS_PER_SECOND = 1000;

const DEFAULT_PORT = 3000;


/////////////////////////////////////////////
//  Private functions
/////////////////////////////////////////////

const uncaughtHandler = (err) => {

    const details = {
        "error": err
    };

    if (err.stack) {
        details.stack = {};
        const frames = err.stack.split('\n');
        for (let i=0; i < frames.length; i++) {
            details.stack[i.toString()] = frames[i];
        }
    }

    logger.error(`Unhandled exception: ${err.toString()}.`, { details });

    //  Shutdown
    setTimeout( () => { process.exit(1); }, SHUTDOWN_DELAY_IN_MS);

};

const installUncaughtHandlers = () => {

    process.on('uncaughtException', uncaughtHandler);
    process.on('unhandledRejection', uncaughtHandler);

};

const createApp = () => {

    //  Create our express app
    const app = express();

    //  Disable display of stack errors by default
    app.set('showStackError', false);

    app.use(helmet({ "contentSecurityPolicy": false }));

    //  Each request gets a custom 'service' object attached to Express `req` and `res` objects
    app.use(function(req, res, next) {
        req.service = {};
        res.service = {};
        next();
    });

    //  Hook "per request" logging middleware
    app.use(express_log.logRequest);

    //  Configure environments
    if (process.env.NODE_ENV === 'production') {
        logger.notice('Configuring for PRODUCTION environment...');
        const subnets = (CONF.proxy && CONF.proxy.subnets && Array.isArray(CONF.proxy.subnets)) ?
            CONF.proxy.subnets : [];
        if (subnets.length > 0) {
            logger.notice(`Trust proxies: ${subnets}`);
            app.set('trust proxy', subnets);
        }
    } else {
        logger.notice('Configuring for DEVELOPMENT environment...');
        app.set('showStackError', true);
    }

    return app;

};

const installRoutes = (app) => {

    // -------------
    //  Routes that do not require authentication
    // -------------

    const healthcheckController = require('./app/controllers/healthcheck');
    app.use('/', healthcheckController);

    //  Install catch-all / error routes
    installErrorRoutes(app);

};

const installErrorRoutes = (app) => {

    //  The end of the line in the middleware chain, so request is "not found".
    app.use(function(req, res, next) {
        req.service.Operation = '404-NOT-FOUND';
        next(new ServiceError.NotFound(req.originalUrl));
    });

    // Catch-all error handler.

    /*eslint no-unused-vars: ["error", { "argsIgnorePattern": "next" }]*/
    app.use(function(err, req, res, next) {
        if (typeof err.status === 'undefined') {
            err.status = 500;
        }

        if (app.settings.showStackError && typeof err.stack !== 'undefined') {
            logger.error(`Error stack: ${err.stack}`);
        }

        //  Hang error off response (for logging)
        _.set(res, 'service.error', err);

        ApiUtils.sendErrorResponse(err, req, res);
    });

};

const stopServer = (server) => {

    logger.info('Stopping server...');

    //  Close server
    server.close();

    //  Shutdown
    setTimeout( () => { process.exit(); }, SHUTDOWN_DELAY_IN_MS);

};

const startServer = (app) => {

    //  Create our server
    const server = http.createServer(app);

    const trapExit = () => {
        logger.info('Received shutdown signal. Closing down...');
        stopServer(server);
    };

    process.on('SIGINT', trapExit);
    process.on('SIGTERM', trapExit);

    //  Now start listening for incoming requests
    const port = process.env.PORT || DEFAULT_PORT;
    server.listen(port);

    logger.notice(`${pkg.description} [v.${pkg.version}] started at: ${new Date()}`);
    logger.notice(`Listening on port: ${port}`);

    return server;

};

const configureDatabase = async () => {

    const ssm = require('./lib/ssm');

    //  Retrieve database password from Systems Manager Parameter Store
    const params = {
        "Name": CONF.ssm.db_password_parameter_name,
        "WithDecryption": true
    };

    let data;
    try {
        data = await ssm.getParameter(params).promise();
    } catch (error) {
        throw new ServiceError.Internal("ssm.getParameter() failed", { params, error });
    }

    //  Patch env var with password
    process.env.DB_PASSWORD = data.Value;

    const db = require('./lib/db');

    logger.notice('Establishing MySQL database connection...');

    //  Wait for database connection
    db.waitForConnection().then( () => {});

    logger.notice('Connected to MySQL database!');

};


/////////////////////////////////////////////
//  Entry point
/////////////////////////////////////////////

(async function() {

    //  Install handlers for uncaught exceptions
    installUncaughtHandlers();

    //  Now create our Express app and configure it
    const app = createApp();

    //  Install our routes
    installRoutes(app);

    //  Now start the server.
    const server = startServer(app);

    //  Configure database connection when running in production
    if (process.env.NODE_ENV === 'production') {
        await configureDatabase();
    }

    module.exports = app;

})();
