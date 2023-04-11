const router = require("express").Router();

const userRoutes = require("./user-routes");
const scriptRoutes = require("./script-routes")

router.use("/users", userRoutes);
router.use("/scripts", scriptRoutes);

module.exports = router;
