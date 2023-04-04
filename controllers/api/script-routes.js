const router = require("express").Router();
const { TBLUser, TBLScript } = require("../../models");

// POST create a new script
router.post("/", async (req, res) => {
  /* req.body should look like this...
    {
      "author": "Abed Abed",
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

    const scriptData = await TBLScript.create({
      authorID: req.session.userID, // obtains the user's ID from the current logged in session object (the user's Id is added in the POST routes in the user-routes file)
      title: req.body.title,
      description: req.body.description,
      text: req.body.text,
      status: req.body.status,
      assignedTo: null,
    });

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
        authorID: req.session.userID, // Set the ID of the user making the request as the authorID
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

// PUT updates the script data to assign the script to an Agent who is purchasing the script
router.put("/purchase/:id", async (req, res) => {
  try {
    // Checks if the requested id is appropriated (ensures a script with this id exists in the database)
    const scriptData = await TBLScript.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!scriptData) {
      res.status(404).json({ message: "No script with this id!" });
      return;
    }

    const purchasedScriptData = await TBLScript.update(
      {
        // Update the script status to "purchased" and assign it to the logged in user making the request
        status: "purchased",
        assignedTo: req.session.userID,
      },
      {
        where: {
          id: req.params.id,
          status: "published", // make sure the script is posted to the marketplace
          assignedTo: null, // make sure the script hasn't already been purchased
        },
      }
    );

    // If no script data is updated, the script is not available for purchase
    if (!purchasedScriptData[0]) {
      res
        .status(400)
        .json({ message: "Script is not available for purchase." });
      return;
    }

    res
      .status(200)
      .json({ purchasedScriptData, message: "Script purchased successfully." });
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
