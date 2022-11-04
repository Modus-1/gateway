/*
 * MODUS ASSUMPTION GATEWAY SERVER.
 */

const express = require('express');
const app = express();
const config = require('./data/config.json');
const { logInfo, logError } = require('./lib/logger');
const fs = require('fs');
const { existsAsync } = require('./lib/util');
const path = require('path');

// Serve frontend
app.use("/", express.static(path.join(__dirname, config.frontend.path)));

/**
 * Gateway entry point.
 */
async function main() {
    // Check if frontend has been built
    if((!await existsAsync(config.frontend.path) || !(await fs.promises.stat(config.frontend.path)).isDirectory())) {
        logError("The frontend has not been built, please run `npm run build` in the frontend project.");
        process.exit(1);
    }

    app.listen(config.http.port, ()=> {
        logInfo(`Gateway server is active @ port ${config.http.port}`);
    });
}

main();