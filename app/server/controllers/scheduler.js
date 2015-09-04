var _ = require('lodash');
var async = require('async');
var logger = require('winston');
var moment = require('moment');

var config = require('../../config');
var emailController = require('../controllers/email');
var instagramController = require('../controllers/instagram');
var userModel = require('../models/users');

var SchedulerController = {};

SchedulerController.initializeScheduler = function () {
    var cronJob = require('cron').CronJob;
    var cronDateTime = config.sendEmailSchedule || '0 0 5 * * *'; // occur every day at 5am by default

    SchedulerController.lastEmailSent = moment().subtract(1, 'days');
    logger.info('setting lastEmailSent to: ' + SchedulerController.lastEmailSent.format('YYYY-MM-DD hh:mm a'))
    logger.info('setting schedule to cronDateTime: ' + cronDateTime);
    var sendDigest = new cronJob(cronDateTime, SchedulerController.sendDigestEmails, null, true);
}

SchedulerController.sendDigestEmails = function (callback) {

    if (!callback) {
        callback = function (err) { }; // swallow callback if not present
    }

    emailController.openSmtpTransport();

    var lastEmailSent = SchedulerController.lastEmailSent || moment().subtract(1, 'days');
    logger.info('processing emails with lastEmailSent: ' + lastEmailSent.format('YYYY-MM-DD hh:mm a'));

    SchedulerController.lastEmailSent = moment();

    var stats = {
        numEmailsSent: 0,
        numUsersProcessed: 0,
        numErrors: 0
    }

    var users = userModel.getUsers();
    async.eachSeries(users, function (user, userSeriesCallback) {
        async.waterfall([
            function (asyncCallback) {
                instagramController.getNewPicturesForUser(user, lastEmailSent.format('X'), asyncCallback);
            },
            function (medias, asyncCallback) {
                if (medias.length < 1) {
                    logger.info('no recent pictures for user ' + user.instagramUsername);
                    stats.numUsersProcessed++;
                    asyncCallback(null);
                }
                else {
                    logger.info(medias.length + ' recent picture(s) found for user ' + user.instagramUsername);
                    async.eachSeries(user.recipients, function (recipientEmail, recipientSeriesCallback) {
                        stats.numEmailsSent++;
                        emailController.sendEmail(user, recipientEmail, medias, recipientSeriesCallback);
                    }, function (recipientSeriesErr) {
                        if (recipientSeriesErr) {
                            stats.numEmailsSent--;
                            asyncCallback(recipientSeriesErr);
                        }
                        else {
                            stats.numUsersProcessed++;
                            asyncCallback(null);
                        }
                    });
                }
            }
        ], function (asyncErr) {
            if (asyncErr) {
                stats.numErrors++;
            }
            userSeriesCallback(null);
        });
    }, function (userSeriesErr) {
        logger.info('finished processing all emails:\n' + JSON.stringify(stats));
        emailController.closeSmtpTransport();
        callback(null, stats);
    });
}

// TODO: UNCOMMENT THIS
SchedulerController.initializeScheduler();

module.exports = SchedulerController;