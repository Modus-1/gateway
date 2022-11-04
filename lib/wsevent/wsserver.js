/*
Web Socket event queue.
*/

const { Server } = require('socket.io');
const { logInfo } = require('../logger');
const { MODUS_SESSION_TYPE } = require('../session/session');
const { constructResponseObject } = require('../util/api');
const UserClient = require('./clients/user-client');
const SocketClient = require('./sockclient');

/** @type {Server} */
let io;

/**
 * Binds the web socket event queue to the specified server;
 * @param {import('http').Server} server The HTTP server to bind to.
 */
function bind(server) {
    io = new Server(server);
}

/** @type {SocketClient[]} */
const wsClients = [];

/**
 * Gets the socket client for the specified socket ID.
 * @param {string} socketId The socket ID to get the client for.
 */
function getSockClient(socketId) {
    return wsClients.find(x => x.socket == socketId);
}

/**
 * Removes the socket client.
 * @param {string} socketId The ID of the socket to remove the client for.
 */
function removeSockClient(socketId) {
    const idx = wsClients.findIndex(x => x.socket == socketId);

    if(idx !== -1)
        wsClients.splice(idx, 1);
} 

/**
 * Pushes a new client instance.
 * @param {SocketClient} client The client instance to push.
 */
function pushClient(client) {
    const prevClient = getSockClient(client.socket);

    if(prevClient)
        return; // Do not create a new client if it exists

    wsClients.push(client);
}

/**
 * Initializes the websocket server.
 * @param {{ sessionMgr: import('../session/sessmgr') }} appContext Application context
 */
function init(appContext) {
    // Create client
    io.on('connect', (sock)=>{
        logInfo(`WS Client: ${sock.id}`);
        sock.emit('auth-required'); // Inform client

        // Add auth event
        // Here we check the session ID and provide the right client in return
        sock.on('announce', (sessionId) => {
            // Check which client we must give based on the session ID
            const session = appContext.sessionMgr.findSession(sessionId);

            // Only work with sockets which have a valid session
            if(!session) {
                // Send error and end this socket
                sock.emit('auth-fail', constructResponseObject(false, "Session is not valid"));
                sock.disconnect();
                return;
            }

            /** @type {SocketClient} */
            let client = getSockClient(sock.id);

            // Check if socket already has client
            if(client != null) {
                sock.emit('auth-complete');
                return;
            }

            switch(session.type) {
                case MODUS_SESSION_TYPE.USER:
                    // Create user client
                    client = new UserClient(sock);
                    break;
                case MODUS_SESSION_TYPE.ADMINISTRATION:
                    // Create admin client
                    throw new Error("Not implemented - admin view WS client");
                case MODUS_SESSION_TYPE.KITCHEN_VIEW:
                    // Create kitchen client
                    throw new Error("Not implemented - kitchen view WS client");
            }

            client.sessionId = sessionId;
            client.socket = sock.id;
            
            // Attempt to register events.
            try {
                pushClient(client);
                client.registerEvents();
                sock.emit('auth-complete');
            } catch(e) {
                // Disconnect user
                sock.emit('auth-fail', constructResponseObject(false, "ISE Client failure"));
                sock.disconnect();
            }
        });

        sock.on('disconnect', ()=> {
            logInfo(`WS Client Gone: ${sock.id}`);

            // Remove client and call clean up
            const client = getSockClient(sock.id);

            if(client) {
                try {
                    client.cleanup();
                } catch(e) {
                    // Ignore cleanup errors
                }

                removeSockClient(sock.id);
            }
        });
    });
}

module.exports = {
    bind,
    init
}