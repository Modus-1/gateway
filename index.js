/*
 * MODUS ASSUMPTION GATEWAY SERVER.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { logInfo, logError } = require('./lib/logger');
const { existsAsync } = require('./lib/util/misc');

const app = express();
const server = http.createServer(app);
const config = require('./data/config.json');
const wsEventQueue = require('./lib/event/wsequeue');

/**
 * Developer mode switch.
 * 
 * When enabled, the result is proxied.
 * It can be toggled from the command line with option --dev.
 */
let DEV_MODE = process.argv.includes("--dev");

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
    if(process.argv.includes("--dev"))
        logInfo("Development mode enabled! ** This option is discouraged for production use **");

    // Check if frontend has been built
    if((!await existsAsync(config.frontend.path) || !(await fs.promises.stat(config.frontend.path)).isDirectory())) {
        logError("The frontend has not been built, please run `npm run build` in the frontend project.");
        process.exit(1);
    }

    // Bind event queue
    wsEventQueue.bind(server);

    // Start the server
    server.listen(config.http.port, ()=> {
        logInfo(`Gateway server is active @ port ${config.http.port}`);
    });
}

main();