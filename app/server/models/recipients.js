var _ = require('lodash');
var logger = require('winston');

var recipientConfig = require('../config/recipients.json');

var RecipientModel = {};

RecipientModel.getRecipients = function () {
    return recipientConfig;
}

RecipientModel.getRecipient = function (email) {
    return _.findWhere(RecipientModel.getRecipients(), { recipientEmail: email });
}

RecipientsModel.getDailyDigestRecipients = function () {
    return _.findWhere(RecipientModel.getRecipients(), { dailyDigest: true });
}

RecipientsModel.getWeeklyDigestRecipients = function () {
    return _.findWhere(RecipientModel.getRecipients(), { weeklyDigest: true });
}

module.exports = RecipientModel;