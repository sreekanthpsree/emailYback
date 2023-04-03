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

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get('*', function (req, res) {
  const index = path.join(__dirname, 'build', 'index.html');
  res.sendFile(index);
});
}
const PORT = process.env.PORT || 5000;
app.listen(PORT);
