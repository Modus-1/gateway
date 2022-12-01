/*
Session manager
*/

const { ModusSession } = require('./session');

/** @type {ModusSession[]} */
let activeSessions = [];

/**
 * Finds the specified session by tableNumber AND id.
 * @param {String} id The session id to find.
 * @param {Number} tableNumber The session tableNumber to find.
 */
function findSession(id, tableNumber) {
    if (id) {
        return activeSessions.find(x => x.id == id);
    }

    return activeSessions.find(x => x.tableNumber == tableNumber);
}

/**
 * Ends the specified session.
 * @param {String} id The ID of the session to end.
 */
function endSession(id) {
    const sessionIdx = activeSessions.findIndex(x => x.id == id);
    activeSessions.splice(sessionIdx, 1);
}

/**
 * Creates a session and activates it.
 * @param {Number} type The session type to create.
 */
function createSession(type, tableNumber) {
    const sess = new ModusSession(type, tableNumber);
    activeSessions.push(sess);
    return sess;
}

module.exports = {
    createSession,
    findSession,
    endSession
}