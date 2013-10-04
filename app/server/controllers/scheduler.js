var logger = require('../modules/logger');
var Config = require('../controllers/config');
var _ = require('underscore');
var moment = require('moment');
var UserController = require('../controllers/user');
var RecipientController = require('../controllers/recipient');
var InstagramController = require('../controllers/instagram');
var EmailController = require('../controllers/email');

var Scheduler = {};

Scheduler.setupScheduler = function () {
    var cronJob = require('cron').CronJob;
    // TODO: CHANGE BACK TO 3am
    var cronTime = '0 30 * * * *'; // occur every day at 3pm
    // TODO: GET CRONTIME FROM CONFIG IN DB
    logger.info('Setting schedule to the following cronTime: ' + cronTime, 'Scheduler');
    var sendTestDigest = new cronJob(cronTime, Scheduler.sendTestEmail, null, true);
}

Scheduler.sendTestEmail = function () {
    logger.debug('Entering scheduler.sendTestEmail()', 'sendTestEmail');
    EmailController.openSmtpTransport();
    EmailController.sendTest(function (err) {
        EmailController.closeSmtpTransport();
    });
}

Scheduler.sendTestDigest = function () {
    EmailController.openSmtpTransport();

    var medias = [
    {
        "attribution": null,
        "tags": [
            "puppytime"
        ],
        "type": "image",
        "location": null,
        "comments": {
            "count": 1,
            "data": [
                {
                    "created_time": "1380066527",
                    "text": "So sweet!",
                    "from": {
                        "username": "diane123",
                        "profile_picture": "http://images.ak.instagram.com/profiles/anonymousUser.jpg",
                        "id": "333333333",
                        "full_name": "diane123"
                    },
                    "id": "552299525440081358"
                }
            ]
        },
        "filter": "Normal",
        "created_time": "1380064055",
        "link": "http://instagram.com/p/abc123/",
        "likes": {
            "count": 3,
            "data": [
                {
                    "username": "tracy123",
                    "profile_picture": "http://images.ak.instagram.com/profiles/anonymousUser.jpg",
                    "id": "1111111111",
                    "full_name": "Tracy"
                },
                {
                    "username": "lauren123",
                    "profile_picture": "http://images.ak.instagram.com/profiles/anonymousUser.jpg",
                    "id": "222222222",
                    "full_name": "Lauren"
                },
                {
                    "username": "diane123",
                    "profile_picture": "http://images.ak.instagram.com/profiles/anonymousUser.jpg",
                    "id": "333333333",
                    "full_name": "Diane"
                }
            ]
        },
        "images": {
            "low_resolution": {
                "url": "http://distilleryimage10.s3.amazonaws.com/41c7b01c29da11e39edf22000aeb311e_6.jpg",
                "width": 306,
                "height": 306
            },
            "thumbnail": {
                "url": "http://distilleryimage10.s3.amazonaws.com/41c7b01c29da11e39edf22000aeb311e_5.jpg",
                "width": 150,
                "height": 150
            },
            "standard_resolution": {
                "url": "http://distilleryimage10.s3.amazonaws.com/41c7b01c29da11e39edf22000aeb311e_7.jpg",
                "width": 612,
                "height": 612
            }
        },
        "users_in_photo": [],
        "caption": {
            "created_time": "1380064089",
            "text": "The new puppy. #puppytime",
            "from": {
                "username": "bryanrosenbaum",
                "profile_picture": "http://images.ak.instagram.com/profiles/anonymousUser.jpg",
                "id": "175321511",
                "full_name": "Bryan Rosenbaum"
            },
            "id": "552348884321408964"
        },
        "user_has_liked": false,
        "id": "552339753229865153_175325111",
        "user": {
            "username": "bryan123",
            "website": "",
            "profile_picture": "http://images.ak.instagram.com/profiles/anonymousUser.jpg",
            "full_name": "Bryan R",
            "bio": "",
            "id": "444444444"
        }
    }
    ];

    var user = { instagramUsername: 'bryan123', instagramId: '444444444', fullName: 'Bryan R' };
    var recipient = { email: EmailController.config.testEmailAddress };

    setTimeout(function () {
        EmailController.sendDigest(user, recipient, medias, function () {
            EmailController.closeSmtpTransport();
        })
    }, 1000);
}

Scheduler.sendDigestEmail = function () {
    /*
        get users from database
        foreach (user) {
            get instagram pics for user
            update the user's lastsentdate
            foreach (recipient matched to user) {
                send email to each user
            }
        }
    */

    EmailController.openSmtpTransport();

    UserController.getAllUsers(function (err, users) {

        // TODO: Log all email activity to mongodb in a separate table

        if (err) {
            logger.error('Unable to get all users, so not processing emails for anyone', 'sendDigestEmail');
            return;
        }
        else {
            logger.debug('Iterating through ' + users.length + ' users', 'sendDigestEmail');
            _.each(users, function (user, userIterator) {
                // TODO: UPDATE THIS AFTER SENDING ALL OF THE EMAILS
                var currentEmailAttemptDate = Date.now();
                var lastEmailAttemptDate;
                var lastEmailAttemptTimestamp;

                if (user.lastEmailAttemptDate) {
                    //lastEmailAttemptTimestamp = moment(user.lastEmailAttempt).format('X'); //format as unix timestamp
                    lastEmailAttemptDate = user.lastEmailAttempt;
                }
                else {
                    var dateNow = new Date();
                    var dateTwoDaysAgo = dateNow.setDate(dateNow.getDate() - 2);
                    lastEmailAttemptDate = dateTwoDaysAgo;
                    //lastEmailAttemptTimestamp = moment(dateTwoDaysAgo).format('X');
                }

                lastEmailAttemptTimestamp = moment(lastEmailAttemptDate).format('X');
                logger.debug('LastEmailAttemptDate: ' + moment(lastEmailAttemptDate).format('YY-MM-DD HH:mm'), 'sendDigestEmail', user.instagramUsername);
                user.lastEmailAttemptDate = currentEmailAttemptDate;

                InstagramController.getNewPicturesForUser(user, lastEmailAttemptTimestamp, function (err, medias) {
                    if (err) {
                        logger.error('Unable to get new pictures for user, so not processing emails for user', 'sendDigestEmail', user.instagramUsername);
                    }
                    else {
                        logger.debug('Successfully found ' + medias.length + ' picture(s) for user, so iterate through recipients', 'sendDigestEmail', user.instagramUsername);
                        RecipientController.getRecipientsForUser(user, function (err, recipients) {
                            if (err) {
                                logger.error('Unable to get recipients for user, so not processing emails for user', 'sendDigestEmail', user.instagramUsername);
                            }
                            else {
                                logger.debug('Successfully found ' + recipients.length + ' recipients for user');

                                _.each(recipients, function (recipient, recipientIterator) {
                                    EmailController.sendDigest(user, recipient, medias, function (err) {
                                        if (err) {
                                            logger.error('Error sending email to ' + recipient.email, 'sendDigestEmail', user.instagramUsername);
                                        }
                                        else {
                                            logger.debug('Successfully sent email to ' + recipient.email, 'sendDigestEmail', user.instagramUsername);
                                        }

                                        if (recipientIterator + 1 === recipients.length) {
                                            user.save(function (err, savedUser) {
                                                if (err) {
                                                    logger.error('Error saving user with updated lastEmailAttempt: ' + err, 'sendDigestEmail', user.instagramUsername);
                                                }
                                                else {
                                                    logger.debug('Successfully saved user with updated lastEmailAttemptDate:' + user.lastEmailSuccessfullySentDate, 'sendDigestEamil', user.instagramUsername);
                                                }
                                            });
                                            if (userIterator + 1 === users.length) {
                                                logger.info('Completed processing all emails', 'sendDigestEmail');
                                                EmailController.closeSmtpTransport();
                                            }
                                        }

                                    });
                                });
                            }
                        });
                    }
                });
            });
        }
    });
}

Scheduler.setupScheduler();

module.exports = Scheduler;

logger.debug('scheduler.js loaded', 'scheduler.js');