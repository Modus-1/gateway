const crypto = require('crypto');

/**
 * Generates a random token.
 */
function generateRandomToken(len = 64) {
    return crypto.randomBytes(len).toString('hex');
}

module.exports = {
    generateRandomToken
}