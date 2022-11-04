/*
Misc utilities.
*/

const fs = require('fs');

/**
 * Checks if the item exists.
 * @param {String} f The item to check for.
 */
const existsAsync = async (f) => {
    try {
        await fs.promises.access(f, fs.constants.F_OK);
        return true;
    } catch(e) {
        return false;
    }
}

module.exports = {
    existsAsync
}