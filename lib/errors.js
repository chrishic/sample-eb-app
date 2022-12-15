/*!
 * Sample Elastic Beanstalk App with MySQL
 * ---------------------------------------
 * Errors.
 */

'use strict';

const http = require('http'),
    util = require('util');


/////////////////////////////////////////////
//  Helper functions
/////////////////////////////////////////////

function isObj(val) {
    return (val !== null && typeof val === 'object' && !Array.isArray(val));
}

// * ----------------------------
// Base errors.  All custom errors inherit off one of these.
// * ----------------------------

function UncheckedError(msg, constructor) {
    Error.captureStackTrace(this, constructor || this);
    this.message = msg || 'Error';
}
util.inherits(UncheckedError, Error);
UncheckedError.prototype.name = 'UncheckedError';


function CheckedError(msg) {
    this.message = msg || 'Error';
}
util.inherits(CheckedError, Error);
CheckedError.prototype.name = 'CheckedError';


// * ----------------------------
//  Application-level errors.
// * ----------------------------

function Internal(msg, details) {
    Internal.super_.call(this, msg, this.constructor);
    if (isObj(details)) {
        this.details = (Object.keys(details).length > 0) ? details : details.toString();
    }
}
util.inherits(Internal, UncheckedError);
Internal.prototype.name = 'Internal';


// * ----------------------------
//  API-specific errors
//  These map to HTTP failure codes
// * ----------------------------

function ApiError(status) {
    const msg = http.STATUS_CODES[status] || '';
    ApiError.super_.call(this, msg);
    this.status = status;
}
util.inherits(ApiError, CheckedError);
ApiError.prototype.name = 'ApiError';


function BadRequest(details) {
    BadRequest.super_.call(this, 400);
    this.details = details || '';
}
util.inherits(BadRequest, ApiError);
BadRequest.prototype.name = 'Bad request';


function Unauthorized(reason, details) {
    Unauthorized.super_.call(this, 401);
    this.reason = (reason && typeof reason === 'string') ? reason : '';
    this.details = details;
}
util.inherits(Unauthorized, ApiError);
Unauthorized.prototype.name = 'Unauthorized';


function Forbidden(details) {
    Forbidden.super_.call(this, 403);
    this.details = details || '';
}
util.inherits(Forbidden, ApiError);
Forbidden.prototype.name = 'Forbidden';


function NotFound(path) {
    NotFound.super_.call(this, 404);
    this.details = path ? 'Cannot find ' + path : '';
}
util.inherits(NotFound, ApiError);
NotFound.prototype.name = 'Not found';


function ServerFailure(err) {
    ServerFailure.super_.call(this, 500);
    this.details = err;
}
util.inherits(ServerFailure, ApiError);
ServerFailure.prototype.name = 'Server failure';


function BadGateway(reason, details) {
    BadGateway.super_.call(this, 502);
    this.reason = (reason && typeof reason === 'string') ? reason : '';
    this.details = details;
}
util.inherits(BadGateway, ApiError);
BadGateway.prototype.name = 'Bad gateway';


/////////////////////////////////////////////
//  Exports
/////////////////////////////////////////////

module.exports = {
    Internal,
    BadRequest,
    NotFound,
    Unauthorized,
    Forbidden,
    ServerFailure,
    BadGateway
};
