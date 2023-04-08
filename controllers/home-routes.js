const router = require("express").Router();
const { TBLUser, TBLScript, TBLMessages } = require("../models");

// GET request to render the main page with the login/signup form
router.get("/", async (req, res) => {
  const isLoggedIn = true; //TODO: Check if session is active

  if (isLoggedIn) {
    const isWriter = true; //TODO: Check user type

    if (isWriter) {
      res.redirect("/writer/home");
    } else {
      res.redirect("/agent/home");
    }

    return;
  }

  res.render("homepage");
});

const allowedWriterRoutes = ["home", "posted", "workspace", "messages"];

// GET request to render the homepage for the writer once they are logged in
router.get("/writer/:route", async (req, res) => {
  const { route } = req.params;

  const isLoggedIn = true; //TODO: Check if session is active

  if (!isLoggedIn) {
    res.redirect("/");
    return;
  }

  if (allowedWriterRoutes.includes(route)) {
    res.render(`writer-${route}`, { [route]: true });
  } else {
    res.redirect("/writer/home");
  }
});

const allowedAgentRoutes = ["home", "purchased", "browse", "messages"];

// GET request to render the homepage for the agent once they are logged in
router.get("/agent/:route", async (req, res) => {
  const { route } = req.params;

  const isLoggedIn = true; // TODO: Check if session is active

  if (!isLoggedIn) {
    res.redirect("/");
    return;
  }

  if (allowedAgentRoutes.includes(route)) {
    res.render(`agent-${route}`, { [route]: true });
  } else {
    res.redirect("/agent/home");
  }
});

// GET request to render the homepage for the writer or agent once they are logged in
router.get("/loggedin", async (req, res) => {
  console.log("here");
  const page = req.query.page;
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

    // const userData = await TBLUser.findByPk(req.session.userID, {
    //   include: [
    //     {
    //       model: TBLRole,
    //     },
    //   ],
    //   attributes: { exclude: ["password"] }, // exclude the password since we do not want to return sensitive information
    // });

    // // Check if a user is found with the requested ID
    // if (!userData) {
    //   return res.status(404).json({ message: "User data not found" });
    // }

    // Access the userData's TBLRole roleTitle to display the appropriate homepage for writers and agents
    res.render("writer-home", {
      userData: {
        id: 1,
        firstName: "abed",
        lastName: "abed",
        roleID: 1,
        emailAddress: "abed.abed@hotmail.com",
        createdAt: "2023-04-06T23:40:44.000Z",
        updatedAt: "2023-04-06T23:40:44.000Z",
        TBLRole: {
          id: 1,
          roleTitle: "writer",
          createdAt: "2023-04-06T23:39:41.000Z",
          updatedAt: "2023-04-06T23:39:41.000Z",
        },
      },
      isWriter: true,
      loggedIn: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET request to render the scripts page where the writers can view their posted scripts
router.get("/scripts/writer", async (req, res) => {
  try {
    /* scriptData follows the following format:
[
    {
        "id": 1,
        "authorID": 1,
        "title": "Harry Potter",
        "description": "Harry Potter, fictional character, a boy wizard ",
        "text": "Dumbledore zaps all the light out of the lampposts. He puts away the device and a cat meows. Dumbledore looks down at the cat.",
        "status": "draft",
        "assignedTo": null,
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
]*/
    // Finds all the scripts the requesting writer (user) published (purchased and non-purchased)
    const scriptData = await TBLScript.findAll({
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
    });

    if (!scriptData) {
      return res.status(404).json({ message: "No script data found" });
    }

    res.render("scripts", { scriptData, loggedIn: req.session.loggedIn });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET request to render the scripts page where the agents can view their puchased scripts
router.get("/scripts/agent", async (req, res) => {
  try {
    /* scriptData follows the following format:
[
    {
        "id": 1,
        "authorID": 1,
        "title": "Harry Potter",
        "description": "Harry Potter, fictional character, a boy wizard ",
        "text": "Dumbledore zaps all the light out of the lampposts. He puts away the device and a cat meows. Dumbledore looks down at the cat.",
        "status": "draft",
        "assignedTo": null,
        "createdAt": "2023-04-06T23:45:55.000Z",
        "updatedAt": "2023-04-06T23:45:55.000Z",
        "Author": {
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
    const scriptData = await TBLScript.findAll({
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
    });

    if (!scriptData) {
      return res.status(404).json({ message: "No script data found" });
    }

    res.render("scripts", { scriptData, loggedIn: req.session.loggedIn });
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
