// Import necessary dependencies
const express = require("express");
const session = require("express-session");

// Initializes Sequelize with session store
const SequelizeStore = require("connect-session-sequelize")(session.Store);

// Import routes and sequelize connection
const routes = require("./controllers");
const sequelize = require("./config/connection");

// Initialize express app and set port number
const app = express();
const PORT = process.env.PORT || 3001;

// Sets up session and connect to our Sequelize db
const sess = {
  secret: "!-$cript0matIcs-_$ECret",
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // sets the maximum age for the cookie to be valid. Here, the cookie (and session) will expire after one day.
    httpOnly: true, // Only allow HTTP communication for cookie (session cookie can only be accessed by the server and not by client-side scripts, which helps to prevent XSS attacks)
    secure: true, // Only initialize session cookies when the protocol being used is HTTPS
    sameSite: "strict", // Cookie only sent to the same site as the request origin
  },
  resave: false, // Only saves session if changes are made
  saveUninitialized: true, // Save session even if the session hasn't been authenticated
  // Connect our session configuration to our sequelize database
  store: new SequelizeStore({
    db: sequelize,
  }),
};

// Set up middleware with the session configuration 
app.use(session(sess));

// Parse incoming JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use routes defined in the controllers folder
app.use(routes);

// Synchronize Sequelize models with database and start server
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () =>
    console.log(
      `\nServer running on port ${PORT}. Visit http://localhost:${PORT} and create an account!`
    )
  );
});
