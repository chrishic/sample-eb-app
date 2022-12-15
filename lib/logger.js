/*!
 * Sample Elastic Beanstalk App with MySQL
 * ---------------------------------------
 * Logging singleton.
 */

'use strict';

const winston = require('winston'),
    os = require('os');


/////////////////////////////////////////////
//  Constants
/////////////////////////////////////////////

const LOG_LEVEL = "debug";


/////////////////////////////////////////////
//  Exports
/////////////////////////////////////////////

(function() {

    const LOG_LEVELS = {
        crit: 0,
        error: 1,
        warning: 2,
        notice: 3,
        info: 4,
        request: 5,
        debug: 6
    };

    const transports = [];
    transports.push(new winston.transports.Console());

    const logger = winston.createLogger({
        level: LOG_LEVEL,
        levels: LOG_LEVELS,
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        ),
        transports: transports,
        defaultMeta: { hostname: os.hostname() }
    });

    module.exports = logger;

})();
