const router = require("express").Router();
const { TBLUser, TBLScript } = require("../../../models");

// GET a specified script and it's associated Writer and Assigned Agent. This script is to be used for viewing by the writers and agents.
router.get("/view/:id", async (req, res) => {
  try {
    const dbScriptData = await TBLScript.findByPk(req.params.id, {
      include: [
        { model: TBLUser, as: "Writer" },
        { model: TBLUser, as: "Assignee" },
      ],
    });

    if (!dbScriptData) {
      res.status(404).json();
      return;
    }

    // Convert the Sequelize model instances to plain JavaScript objects for easier manipulation using Javascript methods
    const scriptData = dbScriptData.get({ plain: true });

    res.render("full-script", { scriptData, userRole: req.session.userRole });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;