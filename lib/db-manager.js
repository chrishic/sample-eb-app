/*!
 * Sample Elastic Beanstalk App with MySQL
 * ---------------------------------------
 * DB manager class.
 */

"use strict";

const createSequelize = require('./sequelize');


/////////////////////////////////////////////
//  Constants
/////////////////////////////////////////////

const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = 3306;

const RETRY_DELAY_IN_MS = 1000;


/////////////////////////////////////////////
//  Class definition
/////////////////////////////////////////////

class DBManager {

    constructor({
        database,
        username,
        password,
        host = DEFAULT_HOST,
        port = DEFAULT_PORT,
        opts = {}
    }) {
        const options = { host, port, ...opts };

        this._sequelize = createSequelize(
            { database, username, password },
            options
        );
    }

    get sequelize() {
        return this._sequelize;
    }

    async waitForConnection() {

        let isConnected = false;

        while (!isConnected) {
            try {
                await this._sequelize.authenticate();
                isConnected = true;
            } catch (error) {
                //  Wait before retrying
                await new Promise(resolve => {
                    setTimeout(resolve, RETRY_DELAY_IN_MS);
                });
            }
        }

    }

}


/////////////////////////////////////////////
//  Exports
/////////////////////////////////////////////

module.exports = DBManager;
