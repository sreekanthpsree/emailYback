const sendgrid = require("sendgrid");
const helper = sendgrid.mail;
const keys = require("../config/keys");

class Mailer extends helper.Mail {
  constructor({ subject, recipients }, content) {
    super();
    this.sgApi = sendgrid(keys.sendGridKey);
    this.from_email = new helper.Email("ushapootheri@gmail.com");
    this.subject = subject;
    this.body = new helper.Content("text/html", content);
    this.recipients = this.formatAddresses(recipients);
    this.addContent(this.body);
    this.addClickTracking();
    this.addRecipients();
  }
  formatAddresses(recipients) {
    return recipients.map(({ email }) => {
      return new helper.Email(email);
    });
  }
  addClickTracking() {
    const trackSettings = new helper.TrackingSettings();
    const clickTracking = new helper.ClickTracking(true, true);
    trackSettings.setClickTracking(clickTracking);
    this.addTrackingSettings(trackSettings);
  }
  addRecipients() {
    const persoalize = new helper.Personalization();
    this.recipients.forEach((recipient) => {
      persoalize.addTo(recipient);
    });
    this.addPersonalization(persoalize);
  }
  async send() {
    const request = this.sgApi.emptyRequest({
      method: "POST",
      path: "/v3/mail/send",
      body: this.toJSON(),
    });
    const response = await this.sgApi.API(request);

    return response;
  }
}

module.exports = Mailer;
