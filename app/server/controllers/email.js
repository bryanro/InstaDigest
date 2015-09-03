var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var logger = require('winston');
var moment = require('moment');
var nodemailer = require('nodemailer');

var config = require('../../config');

var EmailController = {};

EmailController.sendEmail = function (instagramUser, recipientEmail, medias, callback) {

    var digestTemplate = '';

    async.series({
        getEmailTemplate: function (asyncCallback) {
            fs.readFile('./app/server/templates/emailTemplate.html', 'utf8', function (err, data) {
                if (err) {
                    asyncCallback(err);
                }
                else {
                    logger.debug('Successfully read emailTemplate file');
                    digestTemplate = data;
                    asyncCallback(null);
                }
            });
        },
        sendEmail: function (asyncCallback) {
            var mailOptions = {
                from: 'InstaDigest <instagramdailydigest@gmail.com>',
                to: recipientEmail,
                subject: 'InstaDigest from ' + instagramUser.instagramUsername + ' - ' + moment().format('YYYY-MM-DD'),
                html: _.template(digestTemplate)({ user: instagramUser, medias: medias }),
                text: ''
            };

            EmailController.smtpTransport.sendMail(mailOptions, asyncCallback);
        }
    }, function (asyncErr) {
        if (asyncErr) {
            logger.error('error sending email: ' + asyncErr);
            callback(asyncErr);
        }
        else {
            logger.info('successfully sent email');
            callback(null);
        }
    });
}

EmailController.openSmtpTransport = function () {
    var smtpTransportOpts = {
        service: 'Gmail',
        auth: {
            user: config.senderEmail.emailAccountAddress,
            pass: config.senderEmail.emailPassword
        }
    };
    logger.info('Opening SMTP Transport', 'openSmtpTransport');
    EmailController.smtpTransport = nodemailer.createTransport(smtpTransportOpts);
}

EmailController.closeSmtpTransport = function () {
    logger.info('Closing SMTP Transport', 'closeSmtpTransport');
    EmailController.smtpTransport.close();
}

module.exports = EmailController;