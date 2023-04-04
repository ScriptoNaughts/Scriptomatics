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
      "emailAddress": "abed.abed@hotmail.com",
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
      emailAddress: req.body.emailAddress,
      password: req.body.password,
    });

    // set up a session with indicating that the new user is logged in and stores this user's ID
    req.session.save(() => {
      req.session.loggedIn = true;
      req.session.userID = userData.id;

      res.status(200).json(userData);
    });
  } catch (err) {
    // Checks if the error is caused due to the validation checks placed in the TBLUser model
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
    const deletedUserData = await TBLUser.destroy({
      where: {
        id: req.params.id,
      },
    });

    // Checks if a user exists in the database with the provided id
    if (!deletedUserData) {
      res.status(404).json({ message: "No user found with that id!" });
      return;
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Allow a user to login
router.post("/login", async (req, res) => {
  try {
    const userData = await TBLUser.findOne({
      where: {
        emailAddress: req.body.emailAddress,
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
    // user is successfully logged in, and a userID keeping track of the id of the logged in user
    req.session.save(() => {
      req.session.loggedIn = true;
      req.session.userID = userData.id;

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
