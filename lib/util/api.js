/**
 * Constructs a response.
 * @param {Boolean} success Whether the request was successful.
 * @param {String} message The message to associate.
 * @param {*} data The data.
 */
function constructResponseObject(successful, message, data) {
    return {
        successful,
        message,
        data
    };
}

/**
 * Sends the specified response object.
 * @param {import('express').Response} res The response to send.
 * @param {Number} code The status code to send.
 * @param {*} obj The response object to send.
 */
function sendResponseObject(res, code, obj) {
    res.contentType('json');
    res.status(code);
    res.send(JSON.stringify(obj));
    res.end();
}

module.exports = {
    constructResponseObject,
    sendResponseObject
}