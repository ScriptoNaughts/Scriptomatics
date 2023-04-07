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
    res.render("homepage", { loggedIn: req.session.loggedIn });
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
