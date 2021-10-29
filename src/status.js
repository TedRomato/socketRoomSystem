
/**
 * @class 
 * Class for status object, that contains status message, and data (if provided).
 */

class Status {
    /**
     * Creates a new Status object.
     * @param {string} message - String name describing status.
     * @param {*} [data] - Data expanding information about this status.
     */
    constructor(message, data = undefined) { 
        this.message = message,
        this.data = data
    }
}

module.exports = {Status}