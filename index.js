/*
 * MODUS ASSUMPTION GATEWAY SERVER.
 */

const express = require('express');
const app = express();
const config = require('./data/config.json');
const { logInfo } = require('./lib/logger');



/**
 * Gateway entry point.
 */
async function main() {
    app.listen(config.http.port, ()=> {
        logInfo(`Gateway server is active @ port ${config.http.port}`);
    });
}

main();