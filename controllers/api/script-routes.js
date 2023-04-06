const router = require("express").Router();
const { TBLUser, TBLScript } = require("../../models");

// GET all scripts and their associated Author and Assigned Agent
router.get("/", async (req, res) => {
  try {
    const scriptData = await TBLScript.findAll({
      include: [
        { model: TBLUser, as: "Author" },
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

// GET a specified script and it's associated Author and Assigned Agent
router.get("/:id", async (req, res) => {
  try {
    const scriptData = await TBLScript.findByPk(req.params.id, {
      include: [
        { model: TBLUser, as: "Author" },
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

// GET route to get all the scripts written by any author whose name (first or last or combination) is included in the client's search term
router.get("/author/:name", async (req, res) => {
  try {
    // Get the search term from the URL parameter and remove any whitespace
    const searchName = req.params.name.replace(/\s/g, "").toLowerCase();

    // Find the role with the title "writer" in the TBLRole table
    const role = await TBLRole.findOne({
      where: { roleTitle: "writer" },
    });

    // Find all users who have a "writer" role
    const authorData = await TBLUser.findAll({
      where: { roleID: role.id },
    });

    if (!authorData) {
      res.status(404).json({ message: "No authors found" });
      return;
    }

    // This array will store all the script records for the specified author(s)
    const scriptsData = [];

    // Loop through all the writers
    for (const author of authorData) {
      // Combine the first and last names of the author's record into one string, removing any whitespace
      const authorName = (author.firstName + author.lastName)
        .replace(/\s/g, "")
        .toLowerCase();

      // Check if the clinet's search term is included in the combined first and last name of the author's record
      if (authorName.includes(searchName)) {
        // If the search term is included, find all the script records written by that author
        const authorScripts = await TBLScript.findAll({
          where: { authorID: author.id },
          include: [
            { model: TBLUser, as: "Author" },
            { model: TBLUser, as: "Assignee" },
          ],
        });

        // Add all the author's scripts to the array
        scriptsData.push(...authorScripts);
      }
    }

    if (!scriptsData || scriptsData.length === 0) {
      res
        .status(404)
        .json({ message: "No scripts found for selected author(s)" });
      return;
    }

    res.status(200).json(scriptsData);
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
        authorID: req.session.userID, // obtains the user's ID from the current logged in session object (the user's Id is added in the POST routes in the user-routes file)
        title: req.body.title,
        description: req.body.description,
        text: req.body.text,
        status: req.body.status,
        assignedTo: null,
      },
      {
        include: [{ model: TBLUser, as: "Author" }],
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
        include: [{ model: TBLUser, as: "Author" }],
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
        include: [
          { model: TBLUser, as: "Author" },
          { model: TBLUser, as: "Assignee" },
        ],
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

module.exports = router;
