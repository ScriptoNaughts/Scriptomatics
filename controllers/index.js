const router = require("express").Router();

const apiRoutes = require("./api"); // for client-facing routes
const developerRoutes = require("./dev") // for backend developer routes
const homeRoutes = require("./home-routes.js");

// home-routes have the prefix "/"
router.use("/", homeRoutes);
// client routes (routes that are requested by the client) have the prefix "/api"
router.use("/api", apiRoutes);
// developer routes (routes not used by clients) which are used for backend management & testing have the prefix "/dev" 
router.use("/dev",developerRoutes)

module.exports = router;