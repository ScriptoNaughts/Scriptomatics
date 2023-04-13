const router = require("express").Router();

const writerRoutes = require("./writer-scripts"); // for api calls used by the writer
const agentRoutes = require("./agent-scripts"); // for api calls used by the agent
const generalRoutes = require('./general-scripts') // for api calls used by the writer & agent

router.use("/writer", writerRoutes);
router.use("/agent", agentRoutes);
router.use("/", generalRoutes);

module.exports = router;
