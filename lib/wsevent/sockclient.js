/**
 * Represents a generic socket client.
 */
class SocketClient {
    constructor() {
        /**
         * The socket identifier.
         */
        this.socket = "";
    }

    /**
     * Registers client events.
     */
    registerEvents() {
        /* Override */
    }

    /**
     * Cleanup for client disconnect.
     */
    cleanup() {
        /* Cleanup Events */
    }
}

module.exports = SocketClient;