const router = require("express").Router();
const { TBLUser, TBLRole, TBLScript } = require("../../models");

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
      where: { roleTitle: req.body.roleTitle },
    });
    const roleId = role ? role.id : null;

    const userData = await TBLUser.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      roleID: roleId,
      emailAddress: req.body.emailAddress,
      password: req.body.password,
    });

    // set up a session indicating that the new user is logged in and stores this user's ID
    req.session.save(() => {
      req.session.loggedIn = true;
      req.session.userID = userData.id;
      req.session.userRole = req.body.roleTitle;

      // redirect to homepage after saving session
      res.redirect("/loggedin");

      // // send response with JSON data
      // res.status(200).json(userData);
    });
  } catch (err) {
    // Checks if the error is caused due to the validation checks placed in the TBLUser model
    if (err.name === "SequelizeValidationError") {
      const errorMessages = err.errors.map((error) => {
        if (error.path === "emailAddress") {
          return "Email is not valid";
        } else if (error.path === "password") {
          return "Password must be at least 8 characters long";
        }
      });
      res.status(400).json({ errors: errorMessages });
    }
    // Checks if the error is caused due to unique constraint errors
    else if (err.name === "SequelizeUniqueConstraintError") {
      const errorMessages = err.errors.map((error) => {
        if (error.path === "emailAddress") {
          return "Email address already exists";
        }
      });
      res.status(400).json({ errors: errorMessages });
    } else {
      res.status(400).json(err);
    }
  }
});

// -------------------- DELETE a user --------------------
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

// -------------------- Allow a user to login --------------------
router.post("/login", async (req, res, next) => {
  try {
    console.log("\n Running user-routes /login \n");
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

    // Find the role of the user requesting to log in (if they are a writer or an agent)
    const role = await TBLRole.findOne({
      where: { id: userData.roleID },
    });

    console.log("\n\nUser Data:" + JSON.stringify(userData) + "\n\n"); // Output the session data to the console
    console.log("\n\nUser Role:" + JSON.stringify(role) + "\n\n"); // Output the session data to the console

    // Regenerate the session to prevent session fixation
    req.session.regenerate(function (err) {
      if (err) next(err);

      // Once the user is authenticated, set up the session with a loggedIn variable showing the status that the
      // user is successfully logged in, a userID keeping track of the id of the logged in user, and a userRole
      // to keep track of the user's title
      req.session.loggedIn = true;
      req.session.userID = userData.id;
      req.session.userRole = role.roleTitle;

      console.log(
        "\n\nLog in Session in user-routes\n\n" +
          JSON.stringify(req.session) +
          "\n\n\n"
      ); // Output the session data to the console

      // save the session before redirection to ensure page load does not happen before session is saved
      req.session.save(function (err) {
        if (err) return next(err);
        res.redirect("/loggedin");
      });
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// -------------------- Allow a user to logout --------------------
router.post("/logout", async (req, res, next) => {
  // Check if user is logged in
  if (req.session.loggedIn) {
    // clear the user data from the session object and save.
    // this will ensure that re-using the old session id
    // does not have a logged in user
    req.session.loggedIn = null;
    req.session.userID = null;
    req.session.save(function (err) {
      if (err) next(err);

      // regenerate the session to help guard against forms of session fixation
      req.session.regenerate(function (err) {
        if (err) next(err);
        // Redirect to home page after successfully logging out
        res.redirect("/");
      });
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;
