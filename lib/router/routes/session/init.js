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
    // Initializes a session
    // Also does auth checks to ensure a non-user session (kitchen view or admin session) can't be created without the right authorization.
    appContext.app.post('/session/init', (req, res) => {
        // Process new session
        if((!req.body) || (typeof req.body.type !== 'number') || (typeof req.body.tableNumber !== 'number'))
            // Return bad request - type must be specified
            return sendResponseObject(res, 400, constructResponseObject(false, "Invalid session type specified."));

        // Before doing anything, check if a session already exists
        // Get session cookie
        const sessionCookie = req.signedCookies['session'];
        let previousSession = appContext.sessionMgr.findSession(sessionCookie, req.body.tableNumber);

        if(previousSession) {
            // Return previous session key
            res.cookie('session', previousSession.id, {
                signed: true,
                maxAge: config.session.maxAge
            })
            
            return sendResponseObject(res, 200, constructResponseObject(true, "", { id: previousSession.id, tableNumber: previousSession.tableNumber }));
        }

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
        const newSession = appContext.sessionMgr.createSession(req.body.type, req.body.tableNumber);

        res.cookie('session', newSession.id, {
            signed: true,
            maxAge: config.session.maxAge
        });

        return sendResponseObject(res, 200, constructResponseObject(true, "", {
            id: newSession.id, tableNumber: newSession.tableNumber
        }));
    });
}

module.exports = {
    init
}