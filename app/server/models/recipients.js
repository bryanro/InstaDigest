var _ = require('lodash');
var logger = require('winston');

var recipientConfig = require('../config/recipients.json');

var RecipientModel = {};

RecipientModel.getRecipients = function () {
    return recipientConfig;
}

RecipientModel.getRecipient = function (email) {
    return _.findWhere(RecipientModel.getRecipients(), { email: email });
}

RecipientModel.getDailyDigestRecipients = function () {
    return _.where(RecipientModel.getRecipients(), { dailyDigest: true });
}

RecipientModel.getWeeklyDigestRecipients = function () {
    return _.where(RecipientModel.getRecipients(), { weeklyDigest: true });
}

module.exports = RecipientModel;