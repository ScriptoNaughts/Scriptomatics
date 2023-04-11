const router = require("express").Router();
const { TBLUser, TBLScript } = require("../../models");

// GET all scripts and their associated Writer and Assigned Agent
router.get("/", async (req, res) => {
  try {
    const scriptData = await TBLScript.findAll({
      include: [
        { model: TBLUser, as: "Writer" },
        { model: TBLUser, as: "Assignee" },
      ],
    });

    if (!scriptData) {
      res.status(404).json();
      return;
    }
    res.status(200).json(scriptData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
