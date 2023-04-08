// Import necessary dependencies
const path = require("path");
const express = require("express");
const session = require("express-session");
// The express-handlebars package will allow us to render handlebar views
const exphbs = require("express-handlebars");
const helpers = require("./utils/helpers");

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
  name: "my-session",
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

// Create an instance of the handlebars engine and set it as the view engine for Express
const hbs = exphbs.create({ helpers });
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// Parse incoming JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// This will allow us to serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

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
