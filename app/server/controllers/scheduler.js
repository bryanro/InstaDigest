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
    var dailyCronDateTime = config.dailyEmailSchedule || '0 0 5 * * *'; // occur every day at 5am by default
    var weeklyCronDateTime = config.weeklyEmailSchedule || '0 0 5 * * 1'; // occur every week on Mondays at 5am

    SchedulerController.lastEmailSent = moment().subtract(1, 'days').startOf('day');
    logger.info('setting lastEmailSent to: ' + SchedulerController.lastEmailSent.format('YYYY-MM-DD hh:mm a'));

    logger.info('setting daily schedule to cronDateTime: ' + dailyCronDateTime);
    var sendDailyDigest = new cronJob(dailyCronDateTime, SchedulerController.sendDailyDigestEmails, null, true, 'America/New_York');

    logger.info('setting weekly schedule to cronDateTime: ' + weeklyCronDateTime);
    var sendWeeklyDigest = new cronJob(weeklyCronDateTime, SchedulerController.sendWeeklyDigestEmails, null, true, 'America/New_York');
}

SchedulerController.sendDailyDigestEmails = function (callback) {

    if (!callback) {
        callback = function (err) { }; // swallow callback if not present
    }

    emailController.openSmtpTransport();

    var lastEmailSent = SchedulerController.lastEmailSent || moment().subtract(1, 'days').startOf('day');
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
                instagramController.getPicturesForUserFromMoment(user, lastEmailSent, asyncCallback);
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
                        emailController.sendDailyDigestEmail(user, recipientEmail, medias, recipientSeriesCallback);
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

SchedulerController.sendWeeklyDigestEmails = function (callback) {

    if (!callback) {
        callback = function (err) { }; // swallow callback if not present
    }

    emailController.openSmtpTransport();

    var startOfLastWeek = moment().subtract(7, 'days').startOf('isoweek');
    logger.info('processing weekly with start of last week: ' + startOfLastWeek.format('YYYY-MM-DD hh:mm a'));

    var stats = {
        numEmailsSent: 0,
        numUsersProcessed: 0,
        numErrors: 0
    }

    var users = userModel.getUsers();
    async.eachSeries(users, function (user, userSeriesCallback) {
        async.waterfall([
            function (asyncCallback) {
                instagramController.getHistoricalPicturesForWeek(user, startOfLastWeek, asyncCallback);
            },
            function (medias, asyncCallback) {
                if (medias.length < 1) {
                    logger.info('no historical pictures for user ' + user.instagramUsername);
                    stats.numUsersProcessed++;
                    asyncCallback(null);
                }
                else {
                    logger.info(medias.length + ' years of pictures found for user ' + user.instagramUsername);
                    async.eachSeries(user.recipients, function (recipientEmail, recipientSeriesCallback) {
                        stats.numEmailsSent++;
                        emailController.sendWeeklyDigestEmail(user, recipientEmail, medias, recipientSeriesCallback);
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