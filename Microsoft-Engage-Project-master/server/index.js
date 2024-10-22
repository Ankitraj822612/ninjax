const express = require("express");
const path = require('path');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const fileUpload = require('express-fileupload');

// Import routes
const users = require("./routes/api/Users");
const exams = require("./routes/api/Exams");
const logs = require("./routes/api/Logs");

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware to handle x-www-form-urlencoded data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());
app.use(express.static(path.resolve(__dirname, '../client/build')));

// Passport middleware and configuration
app.use(passport.initialize());
require("./config/passport")(passport);

// Define routes
app.use("/api/users", users);
app.use("/api/exams", exams);
app.use("/api/logs", logs);

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose.connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
