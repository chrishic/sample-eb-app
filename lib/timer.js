/*!
 * Sample Elastic Beanstalk App with MySQL
 * ---------------------------------------
 * Timer class.
 */

'use strict';


/////////////////////////////////////////////
//  Constants
/////////////////////////////////////////////

const ELAPSED_MS_PRECISION = 3;
const MS_PER_SECOND = 1000;
const MS_PER_NANOSECOND = 1e-6;


/////////////////////////////////////////////
//  Class definition
/////////////////////////////////////////////

class Timer {

    constructor() {
        this._active = false;
    }

    start() {
        if (this._active) {
            throw new Error('Timer already started');
        }

        this._active = true;
        this._startTime = process.hrtime();
    }

    stop() {
        if (!this._active) {
            throw new Error('Timer not started');
        }

        this._active = false;

        const diff = process.hrtime(this._startTime);
        const elapsedMillis = diff[0] * MS_PER_SECOND + diff[1] * MS_PER_NANOSECOND;

        return elapsedMillis.toFixed(ELAPSED_MS_PRECISION);
    }

}


/////////////////////////////////////////////
//  Exports
/////////////////////////////////////////////

module.exports = Timer;
