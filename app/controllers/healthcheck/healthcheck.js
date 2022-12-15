/*!
 * Sample Elastic Beanstalk App with MySQL
 * ---------------------------------------
 * Controller [status].
 */

'use strict';

const os = require('os'),
    pkg = require('../../../package.json');


/////////////////////////////////////////////
//  Public functions
/////////////////////////////////////////////

function getStatus(req, res) {

    //////////////////////////////////////
    //  Compute our metrics
    //////////////////////////////////////

    const v8Mem = process.memoryUsage();

    // `heapTotal`, `heapUsed`: refer to V8's memory usage
    // `rss`: resident set size - amount of space occupied in main memory
    //        for process (includes heap, code segment and stack)

    const v8FreeMem = v8Mem.heapTotal - v8Mem.heapUsed;
    const v8FreeMemUtil = 100 * v8FreeMem / v8Mem.heapTotal;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const freeMemUtil = 100 * freeMem / totalMem;

    //  Determine the number of current connections
    const server = req.socket ? req.socket.server : undefined;
    getCurrentConnections(server, (err, count) => {
        if (err) {
            //  Not fatal -- set count to 0
            count = 0;
        }

        //////////////////////////////////////
        //  Now format our response object
        //////////////////////////////////////

        var status = 200;

        var statusObject = {
            "Status" : {
                "Name": pkg.name,
                "Description": pkg.description,
                "Version": pkg.version,
                "NodeVersion": process.version,
                "Memory": {
                    "FreeMem %" : Math.round(100 * freeMemUtil) / 100,
                    "TotalMem (MB)" : Math.round(totalMem / ( 1024 * 1024 )),
                    "RSS (MB)" : Math.round(v8Mem.rss / ( 1024 * 1024 )),
                    "V8 FreeMem %" : Math.round(100 * v8FreeMemUtil) / 100
                },
                "Process": {
                    "Pid": process.pid,
                    "Uptime (ticks)": process.uptime()
                },
                "Connections": {
                    "Count" : count
                }
            }
        };

        //  output result to client
        res.format({
            json: function() {
                res.status(status).send(statusObject);
            }
        });
    });

}


/////////////////////////////////////////////
//  Private Functions
/////////////////////////////////////////////

const getCurrentConnections = (server, callback) => {

    if (!server || typeof server.getConnections !== 'function') {
        //  Unable to determine current connection count - so simply return 0 on next tick
        return process.nextTick(function() { return callback(null, 0); });
    }

    server.getConnections(callback);

};


/////////////////////////////////////////////
//  Exports
/////////////////////////////////////////////

module.exports = { getStatus };
