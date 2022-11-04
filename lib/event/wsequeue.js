/*
Web Socket event queue.
*/

const { Server } = require('socket.io');

/** @type {Server} */
let io;

/**
 * Binds the web socket event queue to the specified server;
 * @param {import('http').Server} server The HTTP server to bind to.
 */
function bind(server) {
    io = new Server(server);
}

module.exports = {
    bind
}