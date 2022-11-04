/*
 * MODUS ASSUMPTION GATEWAY SERVER.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const cookieParser = require("cookie-parser");
const { logInfo, logError } = require('./lib/logger');
const { existsAsync } = require('./lib/util/misc');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const config = require('./data/config.json');
const { MODUS_SESSION_TYPE, ModusSession } = require('./lib/session/session');
const { sendResponseObject, constructResponseObject } = require('./lib/util/api');

// Import cookie parser
app.use(cookieParser("secret"));
app.use(bodyParser.json());

/**
 * Application context.
 * Contains the current application state.
 */
const appContext = {
    wsEventQueue: require('./lib/event/wsequeue'),
    sessionMgr: require('./lib/session/sessmgr')
}

// [ Session Routes ]
// Provides session management routes to be used by the client.
// Initializes a session
// Also does auth checks to ensure a non-user session (kitchen view or admin session) can't be created without the right authorization.
app.post('/session/init', (req, res) => {
    // Before doing anything, check if a session already exists
    // Get session cookie
    const sessionCookie = req.signedCookies['session'];
    let previousSession = appContext.sessionMgr.findSession(sessionCookie);

    if(previousSession)
        // Return previous session key
        return sendResponseObject(res, 200, constructResponseObject(true, "", { id: previousSession.id }));

    // Process new session
    if((!req.body) || (typeof req.body.type !== 'number'))
        // Return bad request - type must be specified
        return sendResponseObject(res, 400, constructResponseObject(false, "Invalid session type specified."));

    // Get session type
    switch(req.body.type) {
        default:
            // Unknown type
            res.status(400);
            res.end();
            break;
        case MODUS_SESSION_TYPE.ADMINISTRATION:
            // TODO Check for admin secret here
            // This will ensure normal users cannot logon as administrator
            throw new Error("Not implemented - check admin auth secret");
        case MODUS_SESSION_TYPE.KITCHEN_VIEW:
            // TODO Check for kitchen view auth secret
            throw new Error("Not implemented - check kitchen auth secret");
        case MODUS_SESSION_TYPE.USER:
            // Normal users are welcome
            break;
    }

    // Create the session and send it
    const newSessionId = appContext.sessionMgr.createSession(req.body.type).id;
    res.cookie('session', newSessionId, { signed: true });
    return sendResponseObject(res, 200, constructResponseObject(true, "", {
        id: newSessionId
    }));
});


/**
 * Developer mode switch.
 * 
 * When enabled, the result is proxied.
 * It can be toggled from the command line with option --dev.
 */
let DEV_MODE = process.argv.includes("--dev");

// [ Application Routes ]
// Routes the react application to express

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
    appContext.wsEventQueue.bind(server);

    // Start the server
    server.listen(config.http.port, ()=> {
        logInfo(`Gateway server is active @ port ${config.http.port}`);
    });
}

main();