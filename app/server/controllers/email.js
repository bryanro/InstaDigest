var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var logger = require('winston');
var moment = require('moment');
var nodemailer = require('nodemailer');

var config = require('../../config');

var EmailController = {};

EmailController.sendEmail = function (emailSubject, recipientEmail, templateHtml, templateData, callback) {

    var digestTemplate = '';

    var mailOptions = {
        from: 'InstaDigest <instagramdailydigest@gmail.com>',
        to: recipientEmail,
        subject: emailSubject,
        html: _.template(templateHtml)(templateData),
        text: ''
    };

    EmailController.smtpTransport.sendMail(mailOptions, function (err) {
        if (err) {
            logger.error('error sending email to ' + recipientEmail + ': ' + JSON.stringify(err));
            callback(err);
        }
        else {
            logger.info('successfully sent email to recipientEmail');
            callback(null);
        }
    });
}

EmailController.sendDailyDigestEmail = function (instagramUser, recipientEmail, medias, callback) {
    fs.readFile('./app/server/templates/emailTemplate.html', 'utf8', function (err, data) {
        if (err) {
            logger.error('error reading daily email template: ' + err);
            callback(err);
        }
        else {
            logger.debug('successfully read emailTemplate file');
            var digestTemplate = data;
            var templateData = { user: instagramUser, medias: medias };
            var emailSubject = 'InstaDigest from ' + instagramUser.instagramUsername + ' - ' + moment().format('YYYY-MM-DD');
            EmailController.sendEmail(emailSubject, recipientEmail, digestTemplate, templateData, callback);
        }
    });
}

EmailController.sendWeeklyDigestEmail = function (instagramUser, recipientEmail, medias, callback) {
    fs.readFile('./app/server/templates/weeklyDigestTemplate.html', 'utf8', function (err, data) {
        if (err) {
            logger.error('error reading weekly email template: ' + err);
            callback(err);
        }
        else {
            logger.debug('successfully read weeklyDigestTemplate file');
            var digestTemplate = data;
            var templateData = { user: instagramUser, medias: medias };
            var emailSubject = 'Weekly Digest from ' + instagramUser.instagramUsername + ' - ' + moment().format('YYYY-MM-DD');
            EmailController.sendEmail(emailSubject, recipientEmail, digestTemplate, templateData, callback);
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