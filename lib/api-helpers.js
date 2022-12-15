/*!
 * Sample Elastic Beanstalk App with MySQL
 * ---------------------------------------
 * API helper functions.
 */

'use strict';

const _ = require('lodash'),
    he = require('he'),
    logger = require('./logger');


/////////////////////////////////////////////
//  Public functions
/////////////////////////////////////////////

function sendErrorResponse(err, req, res) {

    if (typeof err.status === 'undefined') {
        err.status = 500;
    }

    const errorTitle = err.name || 'An error occurred.';

    let userError;

    if (err.status >= 500) {
        //  Server error

        //  Hide the specifics from the client
        userError = mapErrorToClient(err);

        //  Log actual error
        let actualError = err;

        if (err.status === 500) {
            if (err.details && typeof err.details === 'object') {
                if (Object.keys(err.details).length > 0) {
                    actualError = err.details;
                }
            }
        }

        logger.error(actualError.message, {
            "meta" : {
                "req_id": _.get(req, 'service.req_id', null),
                "error": actualError
            }
        });
    }
    else {
        //  Client error

        //  Hide details if 'Unauthorized' or 'Forbidden' errors
        const hideDetails = (err.status === 401 || err.status === 403) ? true : false;

        userError = mapErrorToClient(err, hideDetails);
    }

    const cleanError = entityEncode(userError);

    const errorObject = {
        "meta" : {
            "status" : err.status,
            "message" : errorTitle
        },
        "error" : cleanError
    };

    res.status(err.status).send(errorObject);

}


/////////////////////////////////////////////
//  Private functions
/////////////////////////////////////////////

const mapErrorToClient = (err, hideDetails) => {

    let userError = {};

    if (typeof hideDetails !== 'boolean') {
        //  Default is to hide details
        hideDetails = true;
    }

    if (err && typeof err === 'object') {
        userError = _.pick(err, ['message', 'status', 'reason']);
        if (!hideDetails) {
            userError.details = err.details;    
        }
    }

    return userError;

};

const entityEncode = err => {

    let encodedErr = err;

    if (err && typeof err === 'string') {
        encodedErr = he.encode(err);
    }
    else if (err && typeof err === 'object') {
        //  Simple object clone
        //  BUGBUG -- what's the *right* way to perform object clone?
        encodedErr = JSON.parse(JSON.stringify(err));

        //  Encode
        if (encodedErr.details && typeof encodedErr.details === 'string') {
            encodedErr.details = he.encode(encodedErr.details);
        }
    }

    return encodedErr;

};


/////////////////////////////////////////////
//  Exports
/////////////////////////////////////////////

module.exports = {
    sendErrorResponse
};
