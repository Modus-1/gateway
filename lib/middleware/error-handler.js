/**
 * Error handling middleware.
 */

const { constructResponseObject, sendResponseObject } = require("../util/api");

module.exports = ((error, req, res, next) => {
    if(error)
        return sendResponseObject(res, 500, constructResponseObject(false, error.message || error));
});