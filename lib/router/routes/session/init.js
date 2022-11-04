const { MODUS_SESSION_TYPE } = require("../../../session/session");
const { constructResponseObject, sendResponseObject } = require("../../../util/api");
const config = require('../../../../data/config.json');

/**
 * Initializes the route.
 * @param {{
 *  app: import('express').Application,
 *  sessionMgr: import('../../../session/sessmgr')
 * }} appContext The app context.
 */
async function init(appContext) {
    // [ Session Routes ]
    // Provides session management routes to be used by the client.
    // Initializes a session
    // Also does auth checks to ensure a non-user session (kitchen view or admin session) can't be created without the right authorization.
    appContext.app.post('/session/init', (req, res) => {
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
                return sendResponseObject(res, 400, constructResponseObject(false, "Invalid session type specified."));
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
        res.cookie('session', newSessionId, {
            signed: true,
            maxAge: config.session.maxAge
        });
        return sendResponseObject(res, 200, constructResponseObject(true, "", {
            id: newSessionId
        }));
    });
}

module.exports = {
    init
}