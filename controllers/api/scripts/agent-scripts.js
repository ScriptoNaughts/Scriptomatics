const router = require("express").Router();
const { TBLUser, TBLScript } = require("../../../models");
const { Op } = require("sequelize");

// GET route to get all the scripts written by any writer whose name (first or last or combination) is included in the client's search term
router.get("/browse/author/:name", async (req, res) => {
  try {
    // Get the search term from the URL parameter and remove any whitespace
    const searchName = req.params.name.replace(/\s/g, "").toLowerCase();
    const dbWriterData = await TBLUser.findAll({
      where: { roleID: 1 },
    });
    if (!dbWriterData) {
      res.status(404).json({ message: "No writers found" });
      return;
    }
    const writerData = dbWriterData.map((writer) =>
      writer.get({ plain: true })
    );
    // This array will store all the script records for the specified writer(s)
    const scriptsData = [];
    // Loop through all the writers
    for (const writer of writerData) {
      // Combine the first and last names of the writer's record into one string, removing any whitespace
      const writerName = (writer.firstName + writer.lastName)
        .replace(/\s/g, "")
        .toLowerCase();
      // Check if the clinet's search term is included in the combined first and last name of the writer's record
      if (writerName.includes(searchName)) {
        // If the search term is included, find all the script records written by that writer
        const dbWriterScripts = await TBLScript.findAll({
          where: {
            writerID: writer.id,
            status: "published",
          },
          include: [
            { model: TBLUser, as: "Writer" },
            { model: TBLUser, as: "Assignee" },
          ],
        });
        /*-------------------------
      Limits the text of each script to the first 50 words as we are only presenting the previews
    ---------------------------*/
        const writerScripts = dbWriterScripts.map((script) => {
          const scriptText = script.get({ plain: true });
          scriptText.text =
            scriptText.text.split(" ").slice(0, 50).join(" ") + "...";
          return scriptText;
        });
        // Add all the writer's scripts to the array
        scriptsData.push(...writerScripts);
      }
    }
    if (!scriptsData || scriptsData.length === 0) {
      res
        .status(404)
        .json({ message: "No scripts found for selected writer(s)" });
      return;
    }
    res.status(200).json(scriptsData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET route to get all the scripts where the client's search term is included in the title
router.get("/browse/title/:title", async (req, res) => {
  try {
    // Get the search term from the URL parameter and remove any whitespace
    const searchTitle = req.params.title.replace(/\s+/g, " ").toLowerCase();

    const dbScriptData = await TBLScript.findAll({
      where: {
        title: {
          [Op.like]: `%${searchTitle}%`,
        },
      },
      include: [
        { model: TBLUser, as: "Writer" },
        { model: TBLUser, as: "Assignee" },
      ],
    });

    if (!dbScriptData) {
      res.status(404).json({ message: "No scripts found" });
      return;
    }
    /*-------------------------
      Limits the text of each script to the first 50 words as we are only presenting the previews
    ---------------------------*/
    const scriptData = dbScriptData.map((script) => {
      const scriptText = script.get({ plain: true });
      scriptText.text =
        scriptText.text.split(" ").slice(0, 50).join(" ") + "...";
      return scriptText;
    });
    res.status(200).json(scriptData);
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
          { model: TBLUser, as: "Writer" },
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

module.exports = router;
