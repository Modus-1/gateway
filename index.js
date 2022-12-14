/*
 * MODUS ASSUMPTION GATEWAY SERVER.
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const http = require("http");
const cookieParser = require("cookie-parser");
const { logInfo, logError } = require("./lib/logger");
const { existsAsync } = require("./lib/util/misc");
const bodyParser = require("body-parser");
const proxy = require("express-http-proxy");

const app = express();
const server = http.createServer(app);
const config = require("./data/config.json");
const { loadAllRoutes } = require("./lib/router/routeloader");

if (process.argv.includes("--dev")) {
  app.use((req, res, next) => {
    //log all requests :)
    logInfo(req.method + " " + req.url);
    next();
  });
}

// Import cookie parser
app.use(cookieParser("secret"));
app.use(bodyParser.json());

/**
 * Application context.
 * Contains the current application state.
 */
const appContext = {
  app,
  wsEventQueue: require("./lib/wsevent/wsserver"),
  sessionMgr: require("./lib/session/sessmgr"),
};

// [ Top level middleware: session management ]
require("./lib/middleware/access-control").init(appContext);

// [ Load routes ]
loadAllRoutes(appContext, ["routes/session"]);

// Menu API routes
app.use(
  "/api/menu",
  proxy(config.services.find((x) => x.name == "menu-api").host)
);

// Order API routes
app.use(
  "/api/order",
  proxy(config.services.find((x) => x.name == "order-api").host)
);

/**
 * Developer mode switch.
 *
 * When enabled, the result is proxied.
 * It can be toggled from the command line with option --dev.
 */
let DEV_MODE = process.argv.includes("--dev");

// [ Application Routes ]
// Routes the react application to express

if (DEV_MODE) {
  // For development, we proxy the react dev server
  // This is needed so we can retain live updates
  app.use("/", proxy(config.frontend.devServer));
} else {
  // For production, we use the build
  // Serve frontend
  app.use("/", express.static(path.join(__dirname, config.frontend.path)));

  // Route requests to react app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, config.frontend.path, "index.html"));
  });
}

// Custom error middleware
app.use(require("./lib/middleware/error-handler"));

/**
 * Gateway entry point.
 */
async function main() {
  // Check if development mode is enabled
  if (process.argv.includes("--dev")) {
    logInfo(
      "Development mode enabled! ** This option is discouraged for production use **"
    );

    //log all requests
    app.use((req, res, next) => {
      console.log(req.method + " " + req.url);
      next();
    });
  } else {
    // Check if frontend has been built
    if (
      !(await existsAsync(config.frontend.path)) ||
      !(await fs.promises.stat(config.frontend.path)).isDirectory()
    ) {
      logError(
        "The frontend has not been built, please run `npm run build` in the frontend project."
      );
      process.exit(1);
    }
  }

  // Bind event queue and init it
  appContext.wsEventQueue.bind(server);
  appContext.wsEventQueue.init(appContext);

  // Start the server
  server.listen(config.http.port, () => {
    logInfo(`Gateway server is active @ port ${config.http.port}`);
  });
}

main();