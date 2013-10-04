var logger = require('../modules/logger');
var Config = require('../controllers/config');
var nodemailer = require('nodemailer');
var moment = require('moment');
var fs = require('fs');
var _ = require('underscore');

var Email = {};

Email.sendTest = function (callback) {
    logger.debug('Entering sendTest()', 'sendTest', 'TEST');
    var nowDateTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

    Email.config.mailOptions.to = Email.config.testEmailAddress;
    Email.config.mailOptions.subject = 'TEST Instagram Daily Digest ' + nowDateTime;
    Email.config.mailOptions.html = '<h1>Send Mail Test</h1><div>' + nowDateTime + '</div>';
    Email.config.mailOptions.text = 'Send mail test: ' + nowDateTime;

    Email.smtpTransport.sendMail(Email.config.mailOptions, function (err, response) {
        if (err) {
            logger.error('Error: ' + err, 'sendTest', 'TEST');
            callback(err);
        }
        else {
            logger.debug('Successfully sent email: ' + response.message, 'sendTest', 'TEST');
            callback(null);
        }
    });
}

Email.sendDigest = function (user, recipient, medias, callback) {
    logger.debug('Entering sendDigest()', 'sendDigest', user.instagramUsername);
    Email.config.mailOptions.to = recipient.email;
    Email.config.mailOptions.subject = 'Instagram Daily Digest ' + moment(Date.now()).format('YYYY-MM-DD');
    var digestTemplate = _.template(Email.config.mailOptions.digestTemplate);
    Email.config.mailOptions.html = digestTemplate({ user: user, medias: medias });
    // TODO: FIX
    Email.config.mailOptions.text = '';
    
    Email.smtpTransport.sendMail(Email.config.mailOptions, function (err, response) {
        if (err) {
            logger.error('Error: ' + err, 'sendDigest', user.instagramUsername);
        }
        else {
            logger.debug('Successfully sent email: ' + response.message, 'sendDigest', user.instagramUsername);
        }
    });
}

Email.initialize = function () {
    Email.config = {
        smtpTransport: {
            service: 'Gmail',
            auth: {
                /*
                user: 
                pass: 
                */
            }
        },
        mailOptions: {
            from: "InstaDigest <instagramdailydigest@gmail.com>"
            /*
            to: 
            subject: 
            text: 
            html: 
            */
        }
    };

    Config.getConfigValue('emailAccount', function (err, emailAccount) {
        if (err) {
            logger.error('Error getting emailAccount.', 'email initialize');
        }
        else if (!emailAccount) {
            logger.error('Error finding emailAccount.', 'email initialize');
        }
        else {
            logger.debug('Success finding emailAccount', 'email initialize');
            Email.config.smtpTransport.auth.user = emailAccount;
        }
    });

    Config.getConfigValue('emailPassword', function (err, emailPassword) {
        if (err) {
            logger.error('Error getting emailPassword.', 'email initialize');
        }
        else if (!emailPassword) {
            logger.error('Error finding emailPassword.', 'email initialize');
        }
        else {
            logger.debug('Success finding emailPassword', 'email initialize');
            Email.config.smtpTransport.auth.pass = emailPassword;
        }
    });

    Config.getConfigValue('testEmailAddress', function (err, testEmailAddress) {
        if (err) {
            logger.error('Error getting testEmailAddress.', 'email initialize');
        }
        else if (!testEmailAddress) {
            logger.error('Error finding testEmailAddress.', 'email initialize');
        }
        else {
            logger.debug('Success finding testEmailAddress: ' + testEmailAddress, 'email initialize');
            Email.config.testEmailAddress = testEmailAddress;
        }
    });

    fs.readFile('./app/server/templates/emailTemplate.html', 'utf8', function (err, data) {
        if (err) {
            logger.error('Error reading emailTemplate.html: ' + err, 'email initialize');
        }
        else {
            logger.debug('Successfully read emailTemplate file', 'email initialize');
            Email.config.mailOptions.digestTemplate = data;
        }
    });
}

Email.openSmtpTransport = function () {
    logger.info('Opening SMTP Transport', 'openSmtpTransport');
    Email.smtpTransport = nodemailer.createTransport('SMTP', Email.config.smtpTransport);
}

Email.closeSmtpTransport = function () {
    logger.info('Closing SMTP Transport', 'closeSmtpTransport');
    Email.smtpTransport.close();
}

Email.initialize();

module.exports = Email;

logger.debug('email.js loaded', 'email.js');