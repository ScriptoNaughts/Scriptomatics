const router = require("express").Router();
const { TBLUser, TBLRole } = require("../../models");

// GET one user
router.get("/:id", async (req, res) => {
  try {
    const userData = await TBLUser.findByPk(req.params.id);
    if (!userData) {
      res.status(404).json({ message: "No user with this id!" });
      return;
    }
    res.status(200).json(userData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST create a new user (The password encryption will be done through Hooks in the sequelize model)
router.post("/", async (req, res) => {
  /* req.body should look like this...
    {
      "firstName": "Abed",
      "lastName": "Abed",
      "roleTitle": "writer",
      "email": "abed.abed@hotmail.com",
      "password": "12$123_2abc"
    }
  */
  try {
    // Find the roleId corresponding to the role title in the request body
    const role = await TBLRole.findOne({
      where: { title: req.body.roleTitle },
    });
    const roleId = role ? role.id : null;

    const userData = await TBLUser.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      roleID: roleId,
      email: req.body.email,
      password: req.body.password,
    });
    req.session.save(() => {
      req.session.loggedIn = true;

      res.status(200).json(userData);
    });
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      const errorMessages = err.errors.map((error) => {
        if (error.path === "email") {
          return "Email is not valid";
        } else if (error.path === "password") {
          return "Password must be at least 8 characters long";
        }
      });
      res.status(400).json({ errors: errorMessages });
    } else {
      res.status(400).json(err);
    }
  }
});

// DELETE a user
router.delete("/:id", async (req, res) => {
  try {
    const userData = await TBLUser.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!userData) {
      res.status(404).json({ message: "No user found with that id!" });
      return;
    }

    res.status(200).json(userData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Allow a user to login
router.post("/login", async (req, res) => {
  try {
    const userData = await TBLUser.findOne({
      where: {
        email: req.body.email,
      },
    });

    // Checks if a user exists in the database with the provided email
    if (!userData) {
      res
        .status(400)
        .json({ message: "Incorrect email or password, please try again" });
      return;
    }

    // checkPassword is an instance in the TBLUser model that compares the user-provided password with their
    // encrypted password that is stored in the database
    const validPassword = await userData.checkPassword(req.body.password);

    // Returns an error if the user's password does not match the encrypted password in the database
    if (!validPassword) {
      res
        .status(400)
        .json({ message: "Incorrect email or password, please try again" });
      return;
    }

    // Once the user is authenticated, set up the session with a loggedIn variable showing the status that the
    // user is successfully logged in
    req.session.save(() => {
      req.session.loggedIn = true;

      res
        .status(200)
        .json({ user: userData, message: "You are now logged in!" });
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Allow a user to logout
router.post("/logout", async (req, res) => {
  // destroys the session associated with the client that made the request
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});