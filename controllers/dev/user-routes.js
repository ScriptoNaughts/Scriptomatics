const router = require("express").Router();
const { TBLUser, TBLRole, TBLScript } = require("../../models");

// GET all users as well as their role information and their associated scripts (scripts they published & scripts they purchased)
router.get("/", async (req, res) => {
  try {
    const userData = await TBLUser.findAll({
      include: [
        {
          model: TBLRole,
        },
        {
          model: TBLScript,
          as: "WriterScripts",
        },
        {
          model: TBLScript,
          as: "AssignedScripts",
        },
      ],
    });

    // Checks if there are any users
    if (!userData) {
      res.status(404).json({ message: "No users found" });
      return;
    }
    res.status(200).json(userData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET one user and their role information and their associated scripts (scripts they published & scripts they purchased)
router.get("/:id", async (req, res) => {
  try {
    const userData = await TBLUser.findByPk(req.params.id, {
      include: [
        {
          model: TBLRole,
        },
        {
          model: TBLScript,
          as: "WriterScripts",
        },
        {
          model: TBLScript,
          as: "AssignedScripts",
        },
      ],
    });

    // Checks if the requested user is in the database
    if (!userData) {
      res.status(404).json({ message: "No user with this id!" });
      return;
    }
    res.status(200).json(userData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;