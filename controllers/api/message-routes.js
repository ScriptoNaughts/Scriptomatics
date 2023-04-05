const router = require("express").Router();
const { TBLUser, TBLMessages } = require("../../models");

// GET all the users that the requesting user has chatted with
router.get("/users", async (req, res) => {
  try {
    // ensures that the user is logged in to allow them to view their messages
    if (!req.session.loggedIn) {
      res
        .status(401)
        .json({ message: "You must be logged in to view your messages." });
      return;
    }

    const users = await TBLMessages.findAll({
      where: {
        senderID: req.session.userID, // obtains the user's ID from the current logged in session object (the user's Id is added in the POST routes in the user-routes file)
      },
      attributes: ["receiverID"], // only retrieves the receiverID from the TBLMessages model
      group: ["receiverID"], // Groups the receiverID to prevent duplicate receiverID's being returned
      include: [
        {
          model: TBLUser,
          attributes: ["id", "email"], // the id and email attributes should be placed as data attributes in the handlebars. This will allows us to use the data-attributes as parameters when making a GET request for the chat with a single user
        },
      ],
    });

    // Checks if any users were found
    if (!users) {
      res.status(404).json({ message: "No users found." });
      return;
    }

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET chat history between the requesting user and their selected receiver
router.get("/user/chat/:id", async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      res
        .status(401)
        .json({ message: "You must be logged in to view your messages." });
      return;
    }

    // checks the database for the receiver that the logged in user is trying to chat with
    const receiver = await TBLUser.findOne({
      where: {
        id: req.params.id,
      },
    });

    // Checks if receiver with that id exists in the user database
    if (!receiver) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Finds all the chat history between the sender and the receiver
    const messageHistory = await TBLMessages.findAll({
      where: {
        senderID: req.session.userID,
        receiverID: receiver.id,
      },
      order: [["timeStamp", "ASC"]], // Orders the chat with the newest messages at the bottom
      limit: 50, // This will load the last 50 messages because if the chat history is large it will cause performance issues
    });

    // Checks if any messages were found between the 2 users
    if (!messageHistory) {
      res.status(404).json({ message: "No messages found." });
      return;
    }

    res.status(200).json(messageHistory);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST create a new message
router.post("/", async (req, res) => {
  /* req.body should look like this...
    {
      "email": "abed.abed@hotmail.com",
      "content": "Hey, I just saw your script for Harry Potter and wanted to ask you some questions on it", 
    }
  */
  try {
    // ensures that the user is logged in to allow them to send a message
    if (!req.session.loggedIn) {
      res
        .status(401)
        .json({ message: "You must be logged in to send a message." });
      return;
    }

    const receiver = await TBLUser.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!receiver) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const messageData = await TBLMessages.create({
      senderID: req.session.userID,
      receiverID: receiver.id,
      content: req.body.content,
      // `timeStamp` field is not required here as it's defined in the model to have a default value of `NOW`
    });

    res.status(200).json(messageData);
  } catch (err) {
    res.status(500).json(err);
  }
});
