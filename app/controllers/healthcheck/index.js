/*!
 * Sample Elastic Beanstalk App with MySQL
 * ---------------------------------------
 * Routes for 'healthcheck'.
 */

'use strict';

const express = require('express'), 
    { setOperation } = require('../../../lib/log-request'),
    controller = require('./healthcheck');


/////////////////////////////////////////////
//  Entry point
/////////////////////////////////////////////

(function() {

    const router = express.Router();

    router.get('/status', setOperation('GET-STATUS'), controller.getStatus);

    module.exports = router;

})();
