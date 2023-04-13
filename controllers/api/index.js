const router = require("express").Router();

const userRoutes = require("./user-routes");
const scriptRoutes = require("./scripts");
const messageRoutes = require("./message-routes");

router.use("/users", userRoutes);
router.use("/scripts", scriptRoutes);
router.use("/messages", messageRoutes);

module.exports = router;