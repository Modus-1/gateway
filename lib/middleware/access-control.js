const config = require('../../data/config.json');
const { constructResponseObject, sendResponseObject } = require('../util/api');

/**
 * Initializes the route.
 * @param {{
 *  app: import('express').Application,
 *  sessionMgr: import('../../../session/sessmgr')
 * }} appContext The app context.
 */
async function init(appContext) {
    // The session manager ensures certain parts of the application are only accessible by the correct users.
    appContext.app.use('*', (req, res, next) => {
        // Check if page is privileged
        const acl = config.session.accessControl;
        const session = appContext.sessionMgr.findSession(req.signedCookies['session']);

        for(let rule of acl) {
            // Create regexp object
            let rxp = new RegExp(rule.path, "gi");
            
            if(rxp.test(req.baseUrl)) {
                // Privileged resource found, check access
                if((!session) || (session.type !== rule.levelNeeded)) 
                    return sendResponseObject(res, 403, constructResponseObject(false, "Access denied"));
            }

            rxp = null; // Force GC
        }

        next();
    });
}

module.exports = {
    init
}
