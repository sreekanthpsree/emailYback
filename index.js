const express = require("express");
require("./models/User");
require("./models/Survey");
require("./services/passport");
const keys = require("./config/keys");
const mongoose = require("mongoose");
const app = express();
const cookieSession = require("cookie-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const path = require('path')

app.use(bodyParser.json());

app.use(
  cookieSession({
    makeAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey],
  })
);
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(keys.mongoURI);
require("./routes/authRoutes")(app);
require("./routes/billingRoutes")(app);
require("./routes/surveyRoutes")(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT);
