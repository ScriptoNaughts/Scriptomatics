const router = require("express").Router();
const { Op } = require("sequelize");
const { TBLUser, TBLScript, TBLMessages, TBLRole } = require("../models");

// GET request to render the main page with the login/signup form
router.get("/", async (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/loggedin");
    return;
  }

  res.render("homepage");
});

// GET request to render the homepage for the writer or agent once they are logged in
router.get("/loggedin", async (req, res) => {
  try {
    /* userData follows the following format:
      [
    {
        "id": 1,
        "firstName": "abed",
        "lastName": "abed",
        "roleID": 1,
        "emailAddress": "abed.abed@hotmail.com",
        "createdAt": "2023-04-06T23:40:44.000Z",
        "updatedAt": "2023-04-06T23:40:44.000Z",
        "TBLRole": {
            "id": 1,
            "roleTitle": "writer",
            "createdAt": "2023-04-06T23:39:41.000Z",
            "updatedAt": "2023-04-06T23:39:41.000Z"
        },
    }] */

    console.log(
      "\n\nLogin session in home-routes: " +
        JSON.stringify(req.session) +
        "\n\n"
    );

    let userData = await TBLUser.findByPk(req.session.userID, {
      include: [
        {
          model: TBLRole,
        },
      ],
      attributes: { exclude: ["password"] }, // exclude the password since we do not want to return sensitive information
    });

    // Check if a user is found with the requested ID
    if (!userData) {
      return res.status(404).json({ message: "User data not found" });
    }

    // Convert the Sequelize model instances to plain JavaScript objects for easier manipulation using Javascript methods
    userData = userData.get({ plain: true });

    // Access the userData's TBLRole roleTitle to display the appropriate homepage for writers and agents

    res.render("loggedin", { userData, loggedIn: req.session.loggedIn });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET request to render the scripts page where the writers can have a preview of all their posted scripts (purchased & published)
router.get("/scripts/writer/posted", async (req, res) => {
  try {
    // Query the database for script data

    /*-------------------------
          Script Data follows these 2 Format

    --- purchased script ---
[
    {
        "id": 1,
        "writerID": 1,
        "title": "Harry Potter",
        "description": "Harry Potter, fictional character, a boy wizard ",
        "text": "Dumbledore zaps all the light out of the lampposts. He puts away the device and a cat meows. Dumbledore looks down at the cat.",
        "status": "purchased",
        "assignedTo": 2,
        "createdAt": "2023-04-06T23:45:55.000Z",
        "updatedAt": "2023-04-06T23:45:55.000Z",
         "Assignee": {
            "id": 2,
            "firstName": "graham",
            "lastName": "graham",
            "roleID": 2,
            "emailAddress": "graham.graham@hotmail.com",
            "createdAt": "2023-04-06T23:41:14.000Z",
            "updatedAt": "2023-04-06T23:41:14.000Z"
        }
    }
]

    --- published script (not yet purchased) ---
[
    {
        "id": 1,
        "writerID": 1,
        "title": "Harry Potter",
        "description": "Harry Potter, fictional character, a boy wizard ",
        "text": "Dumbledore zaps all the light out of the lampposts. He puts away the device and a cat meows. Dumbledore looks down at the cat.",
        "status": "published",
        "assignedTo": null,
        "createdAt": "2023-04-06T23:45:55.000Z",
        "updatedAt": "2023-04-06T23:45:55.000Z",
        "Assignee": null
    }
]
    ---------------------------*/

    // Finds all the scripts the requesting writer (user) published (purchased and non-purchased)
    let dbScriptData = await TBLScript.findAll({
      where: {
        writerID: req.session.userID,
        status: {
          // only return published or purchased scripts (not drafts)
          [Op.or]: ["published", "purchased"],
        },
      },
      include: [
        {
          // returns the information of the user who purchased their script
          model: TBLUser,
          as: "Assignee",
          attributes: { exclude: ["password"] }, // exclude's the agents password as that is sensitive information
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    if (!dbScriptData) {
      return res.status(404).json({ message: "No script data found" });
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

    // Render the writer-posted page with the script previews
    res.render("writer-posted", {
      scriptData,
      loggedIn: req.session.loggedIn,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET request to render the scripts page where the agents can have a preview of all their puchased scripts
router.get("/scripts/agent/purchased", async (req, res) => {
  try {
    // Query the database for script data

    /*-------------------------
          Script Data follows the following Format
[
    {
        "id": 1,
        "writerID": 1,
        "title": "Harry Potter",
        "description": "Harry Potter, fictional character, a boy wizard ",
        "text": "Dumbledore zaps all the light out of the lampposts. He puts away the device and a cat meows. Dumbledore looks down at the cat.",
        "status": "purchased",
        "assignedTo": 2,
        "createdAt": "2023-04-06T23:45:55.000Z",
        "updatedAt": "2023-04-06T23:45:55.000Z",
        "Writer": {
            "id": 1,
            "firstName": "abed",
            "lastName": "abed",
            "roleID": 1,
            "emailAddress": "abed.abed@hotmail.com",
            "createdAt": "2023-04-06T23:40:44.000Z",
            "updatedAt": "2023-04-06T23:40:44.000Z"
        }
    }
]*/

    // Finds all the scripts the requested agent (user) purchased
    let dbScriptData = await TBLScript.findAll({
      where: {
        assignedTo: req.session.userID,
        status: "purchased",
      },
      include: [
        {
          // returns the information of the writers of their purchased scripts
          model: TBLUser,
          as: "Writer",
          attributes: { exclude: ["password"] }, // exclude's the writers password as that is sensitive information
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    if (!dbScriptData) {
      return res.status(404).json({ message: "No script data found" });
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

    res.render("agent-purchased", {
      scriptData,
      loggedIn: req.session.loggedIn,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET request to render the browse page where agents can browse published scripts put on the market
// When this page is loaded, the user will initially be presented with all the available published scripts. When
// the user wishes to browse by category, it will trigger the GET routes in the `api` folder
router.get("/agent/browse", async (req, res) => {
  try {
    /* scriptData follows the following format:
[
    {
        "id": 1,
        "writerID": 1,
        "title": "Harry Potter",
        "description": "Harry Potter, fictional character, a boy wizard ",
        "text": "Dumbledore zaps all the light out of the lampposts. He puts away the device and a cat meows. Dumbledore looks down at the cat.",
        "status": "published",
        "assignedTo": null,
        "createdAt": "2023-04-06T23:45:55.000Z",
        "updatedAt": "2023-04-06T23:45:55.000Z",
        "Writer": {
            "id": 1,
            "firstName": "abed",
            "lastName": "abed",
            "roleID": 1,
            "emailAddress": "abed.abed@hotmail.com",
            "createdAt": "2023-04-06T23:40:44.000Z",
            "updatedAt": "2023-04-06T23:40:44.000Z"
        }
    }
]*/

    // Finds all the scripts that are published to the marketplace
    let dbScriptData = await TBLScript.findAll({
      where: {
        status: "published",
      },
      include: [
        {
          // returns the information of the writers of the published scripts
          model: TBLUser,
          as: "Writer",
          attributes: { exclude: ["password"] },
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    if (!dbScriptData) {
      return res.status(404).json({ message: "No script data found" });
    }

    /*-------------------------
      Limits the text of each script to the first 100 words as agents who have not purchased the script should not have full access yet
    ---------------------------*/

    const scriptData = dbScriptData.map((script) => {
      const scriptText = script.get({ plain: true });
      scriptText.text =
        scriptText.text.split(" ").slice(0, 100).join(" ") + "...";
      return scriptText;
    });

    res.render("agent-browse", { scriptData, loggedIn: req.session.loggedIn });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET request to render the workspace where writers can work on their draft scripts
router.get("/writer/workspace", async (req, res) => {
  try {
    /* scriptData follows the following format:
[
    {
        "id": 1,
        "writerID": 1,
        "title": "Harry Potter",
        "description": "Harry Potter, fictional character, a boy wizard ",
        "text": "Dumbledore zaps all the light out of the lampposts. He puts away the device and a cat meows. Dumbledore looks down at the cat.",
        "status": "draft",
        "assignedTo": null,
        "createdAt": "2023-04-06T23:45:55.000Z",
        "updatedAt": "2023-04-06T23:45:55.000Z",
    }
]*/

    // Finds all the scripts the requesting writer (user) has saved in their drafts
    let dbScriptData = await TBLScript.findAll({
      where: {
        writerID: req.session.userID,
        status: "draft",
      },
      order: [["updatedAt", "DESC"]],
    });

    if (!dbScriptData) {
      return res.status(404).json({ message: "No script data found" });
    }

    const scriptData = dbScriptData.map((script) =>
      script.get({ plain: true })
    );

    res.render("writer-workspace", {
      scriptData,
      loggedIn: req.session.loggedIn,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET request to render the messages page where writers and agents can view user's who they have interacted with via messages
router.get("/messages", async (req, res) => {
  try {
    /* The returned usersData will be in the following format:
[
  { id: 2, firstName: 'abed', lastName: 'abed'},
  { id: 3, firstName: 'luba', lastName: 'luba'},
  { id: 3, firstName: 'graham', lastName: 'graham' },
]
       */
    // Finds all users that the requesting user has sent to or received messages from (if the requesting user has both sent and received messgaes from a user, then the user will appear twice (once as the sender and once as the receiver))
    let dbChatUsers = await TBLMessages.findAll({
      where: {
        // Checks all message data if the requesting user was the sender or the receiver
        [Op.or]: [
          { senderID: req.session.userID },
          { receiverID: req.session.userID },
        ],
      },
      attributes: ["senderID", "receiverID"], // retrieves the senderID & receiverID from the TBLMessages model
      group: ["senderID", "receiverID"], // Groups the senderID & receiverID to prevent duplicates of the same sender-receiver combination being returned (same sender & receiver but different message content)
      include: [
        {
          model: TBLUser,
          as: "sender",
          attributes: ["id", "firstName", "lastName"], // the id should be placed as data attributes in the handlebars. This will allows us to use the data-attributes as parameters when making a GET request to retrieve the chat with a specified user
        },
        {
          model: TBLUser,
          as: "receiver",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    // Checks if any users were found
    if (!dbChatUsers) {
      res.status(404).json({ message: "No users found." });
      return;
    }

    const chatUsers = dbChatUsers.map((user) => user.get({ plain: true }));

    // This array will contain all the users the requesting user has sent to or received messages from WITHOUT duplicates of users appearing once as the sender and once as the receiver
    const usersData = [];

    chatUsers.forEach((chat) => {
      if (
        chat.senderID !== req.session.userID && // Ensures the sender is not the requesting user since we want to only find who the requesting user interacted with
        !usersData.some((user) => user.id === chat.senderID) // Ensures the senderID is not already in userData
      ) {
        usersData.push({
          id: chat.senderID,
          firstName: chat.sender.firstName,
          lastName: chat.sender.lastName,
        });
      }

      if (
        chat.receiverID !== req.session.userID && // Ensures the receiver is not the requesting user since we want to only find who the requesting user interacted with
        !usersData.some((user) => user.id === chat.receiverID) /// Ensures the receiverID is not already in userData
      ) {
        usersData.push({
          id: chat.receiverID,
          firstName: chat.sender.firstName,
          lastName: chat.sender.lastName,
        });
      }
    });

    res.render("messages", { usersData, userRole: req.session.userRole });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
