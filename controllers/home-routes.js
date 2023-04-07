const router = require("express").Router();
const { TBLUser, TBLScript, TBLMessages } = require("../models");

// GET request to render the main page with the login/signup form
router.get("/", async (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/homepage");
    return;
  }
  res.render("mainpage");
});

// GET request to render the homepage for the writer or agent once they are logged in
router.get("/homepage", async (req, res) => {
  try {
    /* userData follows the following format:
      [
    {
        "id": 1,
        "firstName": "abed",
        "lastName": "abed",
        "roleID": 1,
        "password": "$2b$10$CNRYhfDAviaeaN2RM1xE/uBpbH3aXfe0dWdtfgXb.cw4rklis1dPi",
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

    const userData = await TBLUser.findByPk(req.session.userID, {
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

    // Access the userData's TBLRole roleTitle to display the appropriate homepage for writers and agents
    res.render("homepage", { userData, loggedIn: req.session.loggedIn });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET request to render the scripts page where the writers can view their posted scripts
router.get("/scripts/writer", async (req, res) => {
  try {
    res.render("scripts", { loggedIn: req.session.loggedIn });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET request to render the scripts page where the agents can view their puchased scripts
router.get("/scripts/agent", async (req, res) => {
  try {
    res.render("scripts", { loggedIn: req.session.loggedIn });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET request to render the browse page where agents can browse published scripts put on the market
router.get("/browse", async (req, res) => {
  try {
    res.render("browse", { loggedIn: req.session.loggedIn });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET request to render the workspace where authors can work on their scripts
router.get("/workspace", async (req, res) => {
  try {
    res.render("workspace", { loggedIn: req.session.loggedIn });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET request to render the messages page where authors and agents can view user's who they have interacted with via messages
router.get("/messages", async (req, res) => {
  try {
    res.render("messages", { loggedIn: req.session.loggedIn });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
