var _ = require('lodash');
var async = require('async');
var logger = require('winston');
var moment = require('moment');

var config = require('../../config');
var emailController = require('../controllers/email');
var instagramController = require('../controllers/instagram');
var userModel = require('../models/users');
var recipientsModel = require('../models/recipients');

var SchedulerController = {};

/**
 * Initialize the scheduler for the daily digest and the weekly digest
 */
SchedulerController.initializeScheduler = function () {
    var cronJob = require('cron').CronJob;
    var dailyCronDateTime = config.dailyEmailSchedule || '0 0 5 * * *'; // occur every day at 5am by default
    var weeklyCronDateTime = config.weeklyEmailSchedule || '0 0 5 * * 1'; // occur every week on Mondays at 5am

    logger.info('setting DAILY schedule to cronDateTime: ' + dailyCronDateTime);
    var sendDailyDigest = new cronJob(dailyCronDateTime, SchedulerController.sendDailyDigestEmails, null, true, 'America/New_York');

    logger.info('setting WEEKLY schedule to cronDateTime: ' + weeklyCronDateTime);
    var sendWeeklyDigest = new cronJob(weeklyCronDateTime, SchedulerController.sendWeeklyDigestEmails, null, true, 'America/New_York');
}

/**
 * Send the daily digest email to all recipients
 * @param callback
 */
SchedulerController.sendDailyDigestEmails = function (callback) {
    if (!callback) {
        callback = function (err) { }; // swallow callback if not present
    }

    emailController.openSmtpTransport();

    var startOfYesterday = moment().subtract(1, 'days').startOf('day');
    logger.info('processing daily with start of yesterday: ' + startOfYesterday.format('YYYY-MM-DD hh:mm a'));

    var stats = {
        numEmailsSent: 0,
        numUsersProcessed: 0,
        numErrors: 0,
        numMediaFound: 0
    }

    var users = userModel.getUsers();
    async.waterfall([
        // get the media (images) for all users
        function (asyncCallback) {
            var medias = [];
            async.each(users, function (user, userCallback) {
                    instagramController.getPicturesForUserFromMoment(user, startOfYesterday, function (err, media) {
                        if (err) {
                            userCallback(err);
                        }
                        else {
                            stats.numMediaFound += media.length;
                            stats.numUsersProcessed += 1;
                            if (media.length > 0) {
                                _.each(media, function (m) {
                                    medias.push(m);
                                });
                            }
                            userCallback(null);
                        }
                    });
                },
                function (eachErr) {
                    asyncCallback(eachErr, medias);
                });
        },
        function (medias, asyncCallback) {
            logger.debug('found ' + medias.length + ' total medias');

            var recipients = recipientsModel.getDailyDigestRecipients();
            logger.debug('recipients: ' + JSON.stringify(recipients));
            async.eachSeries(recipients, function (recipient, recipientSeriesCallback) {
                // filter medias to send only to the recipients' instagram users
                var filteredMedias = _.filter(medias, function (media) {
                    return _.indexOf(recipient.instagramUsers, media.user.username) > -1;
                });

                if (filteredMedias.length < 1) {
                    logger.debug('no pictures to send to ' + recipient.email);
                    recipientSeriesCallback(null);
                }
                else {
                    stats.numEmailsSent++;
                    logger.info('send email to ' + recipient.email + ' with ' + filteredMedias.length + ' pictures');
                    emailController.sendDailyDigestEmail(recipient.email, filteredMedias, recipientSeriesCallback);
                }
            }, function (recipientErr) {
                asyncCallback(recipientErr);
            });
        }
    ], function (waterfallErr) {
        if (waterfallErr) {
            stats.numErrors++;
        }
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
        numErrors: 0,
        numMediaFound: 0
    }

    var users = userModel.getUsers();
    async.waterfall([
        function (asyncCallback) {
            // get the media (images) for all users
            instagramController.getHistoricalPicturesForWeekForUsers(users, startOfLastWeek, asyncCallback);
        },
        function (medias, asyncCallback) {
            /*
            // grouped by user and year

                medias: [{
                    year: 2012,
                    instagramUsername: 'user1',
                    medias: [{ ... }, ...]
                }];

             */

            var recipients = recipientsModel.getWeeklyDigestRecipients();
            logger.debug('recipients: ' + JSON.stringify(recipients));
            async.eachSeries(recipients, function (recipient, recipientSeriesCallback) {
                // filter medias to send only to the recipients' instagram users
                var filteredMedias = _.filter(medias, function (media) {
                    return _.indexOf(recipient.instagramUsers, media.instagramUsername) > -1;
                });

                var filteredMediasByYear = instagramController.consolidateMediaByYear(filteredMedias);

                // send the email
                if (filteredMediasByYear.length < 1) {
                    logger.debug('no pictures to send to ' + recipient.email);
                    recipientSeriesCallback(null);
                }
                else {
                    stats.numEmailsSent++;
                    logger.info('send weekly email to ' + recipient.email + ' with ' + filteredMediasByYear.length + ' years of pictures');
                    emailController.sendWeeklyDigestEmail(recipient.email, filteredMediasByYear, recipientSeriesCallback);
                }
            }, function (recipientErr) {
                asyncCallback(recipientErr);
            });
        }
    ], function (waterfallErr) {
        if (waterfallErr) {
            stats.numErrors++;
        }
        logger.info('finished processing all emails:\n' + JSON.stringify(stats));
        emailController.closeSmtpTransport();
        callback(null, stats);
    })
}

SchedulerController.initializeScheduler();

module.exports = SchedulerController;