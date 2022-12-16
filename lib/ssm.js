/*!
 * Sample Elastic Beanstalk App with MySQL
 * ---------------------------------------
 * Systems Parameter Store (SSM) singleton.
 */

'use strict';

const AWS = require('aws-sdk'),
    CONF = require('config');


/////////////////////////////////////////////
//  Exports
/////////////////////////////////////////////

(function() {

    //  Configure S3 client
    const opts = {
        "apiVersion": "2014-11-06",
        "region": CONF.ssm.region
    };

    const ssm = new AWS.SSM(opts);

    module.exports = ssm;

})();
