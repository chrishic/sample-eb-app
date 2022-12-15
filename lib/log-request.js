/*!
 * Sample Elastic Beanstalk App with MySQL
 * ---------------------------------------
 * Logging middleware for Express.
 */

'use strict';

const on_headers = require('on-headers'),
    uuid = require('uuid'),
    logger = require('./logger'),
    Timer = require('./timer'),
    ServiceUtils = require('./utils');


/////////////////////////////////////////////
//  Constants
/////////////////////////////////////////////

const USER_AGENT_HEADER_NAME = 'user-agent';


/////////////////////////////////////////////
//  Public functions
/////////////////////////////////////////////

function setOperation(operation) {

    return function(req, res, next) {
        req.service.Operation = operation;
        next();
    };

}

function logRequest(req, res, next) {

    //  Start the stopwatch
    req.service.timer = new Timer();
    req.service.timer.start();

    //  Create request id
    req.service.req_id = uuid.v4();

    //  Set up callback that is triggered when response is being sent
    on_headers(res, () => logRequestComplete(req, res));

    //  Proceed.
    next();

}


/////////////////////////////////////////////
//  Private functions
/////////////////////////////////////////////

const logRequestComplete = (req, res) => {

    //  Stop the stopwatch
    const elapsedMillis = req.service.timer.stop();

    const hasError = (res.statusCode >= 400);

    const operation = (req.service && typeof req.service.Operation === 'string') ? req.service.Operation : '';

    const reqInfo = buildRequestContext(req);
    const userInfo = buildUserLogContext(req);

    const logRecord = {
        "req_id": req.service.req_id,
        "result": hasError ? "ERROR" : "SUCCESS",
        "status": res.statusCode,
        "elapsed_millis": elapsedMillis,
        "user": userInfo,
        "request": reqInfo,
        "response": {
            "headers": res.getHeaders()
        }
    };

    if (req.service.details && typeof req.service.details === 'object') {
        logRecord.request.details = req.service.details;
    }

    if (res.service.details && typeof res.service.details === 'object') {
        logRecord.response.details = res.service.details;
    }

    if (operation) {
        logRecord.operation = operation;
    }

    //  If this is an error response, provide error details if available
    if (hasError) {
        logRecord.error = res.service.error || res.statusCode;
    }

    //  Emit the log record
    logger.request('', { "meta" : logRecord });

};

const buildRequestContext = (req) => {

    const reqContext = {
        "method": req.method,
        "url": req.originalUrl,
        "headers": req.headers
    };

    return reqContext;

};

const buildUserLogContext = (req) => {

    const user = (req.user && typeof req.user === 'object') ? req.user : {};

    const userContext = { "ip_address": req.ip, ...user };

    const user_agent = ServiceUtils.getCollectionValue(req.headers, USER_AGENT_HEADER_NAME);
    if (user_agent && typeof user_agent === 'string') {
        userContext.user_agent = user_agent;
    }

    return userContext;

};


/////////////////////////////////////////////
//  Exports
/////////////////////////////////////////////

module.exports = {
    setOperation,
    logRequest
};