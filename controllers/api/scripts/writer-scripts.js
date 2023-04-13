const router = require("express").Router();
const { TBLUser, TBLScript } = require("../../../models");

// GET a specified script and it's associated Writer and Assigned Agent. This script is to be used for editing by the writers.
router.get("/edit/:id", async (req, res) => {
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

    const scriptData = dbScriptData.get({ plain: true });

    res.status(200).json(scriptData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST create a new script
router.post("/", async (req, res) => {
  /* req.body should look like this...
    {
      "title": "Harry Potter",
      "description": "Harry Potter, fictional character, a boy wizard ",
      "text": "Dumbledore zaps all the light out of the lampposts. He puts away the device and a cat meows. Dumbledore looks down at the cat.",
      "status": "draft",
      "assignedTo": null
    }
  */
  try {
    // ensures that the user is logged in to allow them to create a new script
    if (!req.session.loggedIn) {
      res
        .status(401)
        .json({ message: "You must be logged in to post a script." });
      return;
    }

    const scriptData = await TBLScript.create(
      {
        writerID: req.session.userID, // obtains the user's ID from the current logged in session object (the user's Id is added in the POST routes in the user-routes file)
        title: req.body.title,
        description: req.body.description,
        text: req.body.text,
        status: req.body.status,
        assignedTo: null,
      },
      {
        include: [{ model: TBLUser, as: "Writer" }],
      }
    );

    res.status(200).json(scriptData);
  } catch (err) {
    res.status(400).json(err);
  }
});

// PUT updates an existing scripts data
router.put("/:id", async (req, res) => {
  try {
    const updatedScriptData = await TBLScript.update(
      {
        writerID: req.session.userID, // Set the ID of the user making the request as the writerID
        title: req.body.title,
        description: req.body.description,
        text: req.body.text,
        status: req.body.status,
        assignedTo: null,
      },
      {
        where: {
          id: req.params.id,
        },
        include: [{ model: TBLUser, as: "Writer" }],
      }
    );

    // Checks if any rows were affected (i.e. checks if the script being updated exists in the database)
    if (!updatedScriptData[0]) {
      res.status(404).json({ message: "No script with this id!" });
      return;
    }

    res.status(200).json(updatedScriptData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE a draft script in the workspace or a posted script before it is purchased
router.delete("/:id", async (req, res) => {
  try {
    const scriptData = await TBLScript.findOne({
      where: {
        id: req.params.id,
      },
    });

    // Checks if a script with the requested id exists in the database
    if (!scriptData) {
      res.status(404).json({ message: "No script found with that id!" });
      return;
    }

    // Checks to see if the script has been purchased. If not, then allow the script to be deleted
    if (scriptData.status !== "purchased") {
      const deletedScriptData = await TBLScript.destroy({
        where: {
          id: req.params.id,
        },
      });
    } else {
      res.status(400).json({ message: "Cannot delete purchased scripts" });
      return;
    }

    res.status(200).json({ message: "Script deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;