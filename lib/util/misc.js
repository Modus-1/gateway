/*
Misc utilities.
*/

const fs = require('fs');
const config = require('../../data/config.json');

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

/**
 * Gets the specified service URL by name.
 * @param {String} name The name of the service to query the URL for.
 */
const getServiceUrlByName = (name) => {
    return config.services.find(x => x.name == name).host;
}

module.exports = {
    existsAsync,
    getServiceUrlByName
}