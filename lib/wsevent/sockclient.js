/**
 * Represents a generic socket client.
 */
class SocketClient {
    constructor(connection) {
        /**
         * The socket identifier.
         */
        this.socket = "";

        /**
         * The session ID for this client.
         */
        this.sessionId = "";

        /** @type {import('socket.io').Socket} */
        this.connection = connection;
    }

    /**
     * Registers client events.
     */
    registerEvents() {
        this.connection.on('test-ping', ()=>{
            this.connection.emit('test-pong');
        });
    }

    /**
     * Cleanup for client disconnect.
     */
    cleanup() {
        /* Cleanup Events */
    }
}

module.exports = SocketClient;