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

/**
 * Developer mode switch.
 * 
 * When enabled, the result is proxied.
 */
let DEV_MODE = false;

if(DEV_MODE) {
    // For development, we proxy the react dev server
    // This is needed so we can retain live updates
    const proxy = require('express-http-proxy');
    app.use("/", proxy(config.frontend.devServer));
} else {
    // For production, we use the build
    // Serve frontend
    app.use("/", express.static(path.join(__dirname, config.frontend.path)));

    // Route requests to react app
    app.get('*', (req,res) =>{
        res.sendFile(path.join(__dirname, config.frontend.path, "index.html"));
    });
}

/**
 * Gateway entry point.
 */
async function main() {
    // Check if development mode is enabled
    if(process.argv.includes("--dev")) {
        logInfo("Development mode enabled! ** This option is discouraged for production use **");
        DEV_MODE = true;
    }

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