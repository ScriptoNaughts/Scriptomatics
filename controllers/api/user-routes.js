const router = require("express").Router();
const { User, Role } = require("../../models");

// GET one user
router.get("/:id", async (req, res) => {
  try {
    const userData = await User.findByPk(req.params.id);
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
    const role = await Role.findOne({ where: { title: req.body.roleTitle } });
    const roleId = role ? role.id : null;

    const userData = await User.create({
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
    const userData = await User.destroy({
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
