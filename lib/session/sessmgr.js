/*
Session manager
*/

const { ModusSession } = require('./session');

/** @type {ModusSession[]} */
let activeSessions = [];

/**
 * Finds the specified session by ID.
 * @param {String} id The session ID to find.
 */
function findSession(id) {
    return activeSessions.find(x => x.id == id);
}

/**
 * Ends the specified session.
 * @param {String} id The ID of the session to end.
 */
function endSession(id) {
    const sessionIdx = activeSessions.findIndex(x => x.id == id);
    activeSessions.splice(sessionIdx, 1);
    // TODO send WS event
}

/**
 * Creates a session and activates it.
 * @param {Number} type The session type to create.
 */
function createSession(type) {
    const sess = new ModusSession(type);
    activeSessions.push(sess);
    return sess;
}

module.exports = {
    createSession,
    findSession,
    endSession
}