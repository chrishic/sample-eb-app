/*!
 * Sample Elastic Beanstalk App with MySQL
 * ---------------------------------------
 * Database connection singleton.
 */

"use strict";

const logger = require('./logger'),
    DBManager = require('./db-manager');


/////////////////////////////////////////////
//  Exports
/////////////////////////////////////////////

(function() {

    const opts = {
        "logging": msg => logger.debug(msg)
    };

    const dbManager = new DBManager({
        username: process.env.DB_USERNAME,
        host: process.env.DB_HOSTNAME,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        opts
    });

    module.exports = dbManager;

})();
