const requireCredits = require("../middlewares/requireCredits");
const requireLogin = require("../middlewares/requireLogin");
const mongoose = require("mongoose");
const Mailer = require("../services/Mailer");
const surveyTemplate = require("../services/emailTemplates/surveyTemplate");
const Survey = mongoose.model("surveys");
const { Path } = require("path-parser");
const { URL } = require("url");
const _ = require("lodash");

module.exports = (app) => {
  app.get("/api/surveys/:survetId/:choice", (req, res) => {
    console.log(res.user);
    res.redirect("/surveys/thanks");
  });
  app.post("/api/surveys/webhooks", (req, res) => {
    const p = new Path("/api/surveys/:surveyId/:choice");
    _.chain(req.body)
      .map(({ email, url }) => {
        const match = p.test(new URL(url).pathname);
        if (match) {
          return { email, surveyId: match.surveyId, choice: match.choice };
        }
      })
      .compact()
      .uniqBy("email", "surveyId")
      .each(({ surveyId, email, choice }) => {
        Survey.updateOne(
          {
            _id: surveyId,
            recipients: {
              $elemMatch: { email: email, responded: false },
            },
          },
          {
            $inc: { [choice]: 1 },
            $set: { "recipients.$.responded": true },
            $set: { lastResponded: Date.now() },
          }
        ).exec();
      })
      .value();

    res.send({});
  });
  app.post("/api/surveys", requireLogin, requireCredits, async (req, res) => {
    const { title, body, subject, recipients } = req.body;

    const survey = new Survey({
      title,
      body,
      subject,
      recipients: recipients
        .split(",")
        .map((email) => ({ email: email.trim() })),
      _user: req.user.id,
      dateSent: Date.now(),
    });
    const mailer = new Mailer(survey, surveyTemplate(survey));
    try {
      await mailer.send();
      await survey.save();
      req.user.credits -= survey.recipients.length;
      const user = await req.user.save();
      res.send(user);
    } catch (error) {
      res.status(422).send(error);
    }
  });
  app.get("/api/surveys", requireLogin, async (req, res) => {
    const surveys = await Survey.find({ _user: req.user.id }).select({
      recipients: false,
    });

    res.send(surveys);
  });
};
