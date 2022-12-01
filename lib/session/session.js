const { generateRandomToken } = require("../util/crypto");

const MODUS_SESSION_TYPE = {
    /**
     * A normal user session.
     */
    USER: 0,

    /**
     * A kitchen view session.
     */
    KITCHEN_VIEW: 1,

    /**
     * Administration session.
     */
    ADMINISTRATION: 2
}

/**
 * Represents a modus session.
 */
class ModusSession {
    /**
     * Creates a session.
     * @param {Number} type The session type
     */
    constructor(type = MODUS_SESSION_TYPE.USER, tableNumber) {
        this.type = type;
        this.id = generateRandomToken(64);
        this.tableNumber = tableNumber;
    }
}

module.exports = {
    MODUS_SESSION_TYPE,
    ModusSession
}