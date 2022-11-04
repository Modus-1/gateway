const SocketClient = require("../sockclient");

/**
 * Represents the websocket client for a normal user.
 */
class UserClient extends SocketClient {
    constructor(connection) {
        super(connection);
    }

    /**
     * Registers events.
     */
    registerEvents() {
        super.registerEvents();
        
    }

    /**
     * Performs the cleanup.
     */
    cleanup() {
        super.cleanup();

    }
}

module.exports = UserClient;