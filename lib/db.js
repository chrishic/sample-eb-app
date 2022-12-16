/*!
 * Sample Elastic Beanstalk App with MySQL
 * ---------------------------------------
 * Database connection singleton.
 */

"use strict";

const CONF = require('config'),
    logger = require('./logger'),
    DBManager = require('./db-manager');


/////////////////////////////////////////////
//  Exports
/////////////////////////////////////////////

(function() {

    const opts = {
        "logging": msg => logger.debug(msg)
    };

    const dbManager = new DBManager({
        username: CONF.mysql.username,
        host: CONF.mysql.hostname,
        database: CONF.mysql.database,
        password: process.env.DB_PASSWORD,
        opts
    });

    module.exports = dbManager;

})();
