/*!
 * Sample Elastic Beanstalk App with MySQL
 * ---------------------------------------
 * Sequelize connection class.
 */

"use strict";

const { Sequelize } = require('sequelize');


/////////////////////////////////////////////
//  Constants
/////////////////////////////////////////////

const DEFAULT_CONNECTION_OPTIONS = {
    dialect: "mysql",
    dialectOptions: { charset: "utf8" }
};


/////////////////////////////////////////////
//  Exports
/////////////////////////////////////////////

(function () {
    module.exports = (config, options) => {
        if (!config || typeof config !== "object") {
            throw new Error("`config` parameter missing or invalid.");
        }

        if (!config.database || typeof config.database !== "string") {
            throw new Error("`config.database` parameter missing or invalid.");
        }

        if (!config.username || typeof config.username !== "string") {
            throw new Error("`config.username` parameter missing or invalid.");
        }

        if (!config.password || typeof config.password !== "string") {
            throw new Error("`config.password` parameter missing or invalid.");
        }

        if (!options.host || typeof options.host !== "string") {
            throw new Error("`options.host` parameter missing or invalid.");
        }

        if (!options.port || !Number.isInteger(options.port)) {
            throw new Error("`options.port` parameter missing or invalid.");
        }

        const { database, username, password } = config;

        return new Sequelize(database, username, password, {
            ...options,
            ...DEFAULT_CONNECTION_OPTIONS
        });
    };
})();
