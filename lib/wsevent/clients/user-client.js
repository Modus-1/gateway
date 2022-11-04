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

        this.connection.on('get-status', (orderId) => {
            // TODO report order status
        });
    }

    /**
     * Performs the cleanup.
     */
    cleanup() {
        super.cleanup();
    }
}

module.exports = UserClient;