var logger = require('./modules/logger');

module.exports = function (app) {

    // Export the app so it can be used by the controllers
    module.exports.app = app;

    // Test
    app.get('/test', function (req, res) {
        res.send('InstaDigest API is running');
    });

    // HTML Pages
    app.get('/', function (req, res) {
        if (req.session && req.session.auth) {
            res.sendfile('./app/public/index.html');
        }
        else {
            res.sendfile('./app/public/index.html');
        }
    });

    app.get('/logout', function (req, res) {
        req.session.destroy();
        res.redirect('/');
    });

    // TODO: REMOVE
    // TEMP FOR TESTING
    app.get('/email', function (req, res) {
        var _ = require('underscore');

        var medias = [
            {
                "attribution": null,
                "tags": [
                    "slumberpartyweek"
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
                                "username": "drosenbaum205",
                                "profile_picture": "http://images.ak.instagram.com/profiles/anonymousUser.jpg",
                                "id": "177981579",
                                "full_name": "drosenbaum205"
                            },
                            "id": "552360525470081358"
                        }
                    ]
                },
                "filter": "Normal",
                "created_time": "1380064055",
                "link": "http://instagram.com/p/eqTh1yl6HB/",
                "likes": {
                    "count": 3,
                    "data": [
                        {
                            "username": "tfriedman5",
                            "profile_picture": "http://images.ak.instagram.com/profiles/anonymousUser.jpg",
                            "id": "199959512",
                            "full_name": "tfriedman5"
                        },
                        {
                            "username": "lhrosenbaum",
                            "profile_picture": "http://images.ak.instagram.com/profiles/profile_145420114_75sq_1368492653.jpg",
                            "id": "145420114",
                            "full_name": "lhrosenbaum"
                        },
                        {
                            "username": "drosenbaum205",
                            "profile_picture": "http://images.ak.instagram.com/profiles/anonymousUser.jpg",
                            "id": "177981579",
                            "full_name": "drosenbaum205"
                        }
                    ]
                },
                "images": {
                    "low_resolution": {
                        "url": "http://distilleryimage9.s3.amazonaws.com/19bef226256e11e3b52d22000a9f189b_6.jpg",
                        "width": 306,
                        "height": 306
                    },
                    "thumbnail": {
                        "url": "http://distilleryimage9.s3.amazonaws.com/19bef226256e11e3b52d22000a9f189b_5.jpg",
                        "width": 150,
                        "height": 150
                    },
                    "standard_resolution": {
                        "url": "http://distilleryimage9.s3.amazonaws.com/19bef226256e11e3b52d22000a9f189b_7.jpg",
                        "width": 612,
                        "height": 612
                    }
                },
                "users_in_photo": [],
                "caption": {
                    "created_time": "1380064089",
                    "text": "Hats in the bath and then story time. #slumberpartyweek",
                    "from": {
                        "username": "bryanrosenbaum",
                        "profile_picture": "http://images.ak.instagram.com/profiles/profile_175321511_75sq_1376618188.jpg",
                        "id": "175321511",
                        "full_name": "Bryan Rosenbaum"
                    },
                    "id": "552340073431408964"
                },
                "user_has_liked": false,
                "id": "552339792689865153_175321511",
                "user": {
                    "username": "bryanrosenbaum",
                    "website": "",
                    "profile_picture": "http://images.ak.instagram.com/profiles/profile_175321511_75sq_1376618188.jpg",
                    "full_name": "Bryan Rosenbaum",
                    "bio": "",
                    "id": "175321511"
                }
            }
        ];
        var testUser = {
            instagramUsername: 'bryanrosenbaum',
            instagramId: '123456789',
            fullName: 'Bryan Rosenbaum'
        };
        var fs = require('fs');
        fs.readFile('./app/server/templates/emailTemplate.html', 'utf8', function (err, data) {
            if (err) {
                logger.error('Error reading emailTemplate.html: ' + err, 'email initialize');
                res.send(500, 'Error reading email template');
            }
            else {
                logger.debug('Successfully read emailTemplate file');
                var htmlTemplate = _.template(data);
                var templateText = htmlTemplate({ medias: medias, user: testUser });
                res.send(templateText);
            }
        });
    });

    // TODO: REMOVE
    app.get('/recent', function (req, res) {
        var instagramController = require('./controllers/instagram');
        var mongoose = require('mongoose');
        var UserModel = mongoose.model('User');
        UserModel.findOne({ instagramUsername: 'bryanrosenbaum' }, function (err, user) {
            instagramController.getNewPictures(user, function (media) {
                res.send('MEDIA: ' + JSON.stringify(media));
            });
        });
    });

    var scheduler = require('./controllers/scheduler');
    app.get('/emailNow', function (req, res) {
        logger.info('route: emailNow', 'app.get(emailNow)');
        scheduler.sendDigestEmail();
        res.send(202);
    });

    app.get('/testDigestEmail', function (req, res) {
        logger.info('route: testDigestEmail', 'app.get(testDigestEmail)');
        scheduler.sendTestDigest();
        res.send(202);
    });

    var email = require('./controllers/email');
    app.get('/testEmail', function (req, res) {
        scheduler.sendTestEmail();
        res.send(202);
    });

    // Options
    app.options('/*', function (req, res) {
        res.send(200);
    });

    /* Instagram */
    var instagram = require('./controllers/instagram');
    app.get('/auth/instagram/authenticate', instagram.authenticate);
    app.get('/auth/instagram/auth-redirect', instagram.authRedirect);

    /* User */
    var user = require('./controllers/user');
    app.get('/user', user.getUser);

    app.get('/preview-email', function (req, res) {
        var _ = require('underscore');
        var UserController = require('./controllers/user');
        UserController.getInstagramUsernameFromSession(req, function (err, instagramUsername) {
            if (err) {
                logger.error('Error getting instagram username from session', 'previewEmail');
                res.send(500, 'Error getting instagram username from session');
            }
            else {
                logger.debug('Successfully got instagramUsername', 'previewEmail', instagramUsername);
                UserController.getUserInfo(instagramUsername, function (err, user) {
                    if (err) {
                        logger.error('Error getting user info: ' + err, 'previewEmail', instagramUsername);
                        res.send(500, 'Error getting user info');
                    }
                    else {
                        var InstagramController = require('./controllers/instagram');
                        InstagramController.getNewPicturesForUser(user, user.lastEmailAttemptDate, function (err, medias) {
                            if (err) {
                                logger.error('Error getting new pictures for user: ' + err, 'previewEmail', instagramUsername);
                                res.send(500, 'Error getting new pictures for user');
                            }
                            else {
                                logger.debug('Successfully got ' + medias.length + ' new picture(s) for user', 'previewEmail', instagramUsername);
                                var fs = require('fs');
                                var EmailController = require('./controllers/email');
                                var digestTemplate = _.template(EmailController.config.mailOptions.digestTemplate);
                                var digestTemplateText = digestTemplate({ medias: medias, user: user });
                                res.send(200, digestTemplateText);
                            }
                        });
                    }
                });
            }
        });
    });

    /* Recipient */
    
    var recipient = require('./controllers/recipient');
    app.get('/recipients', recipient.getRecipients);
    app.post('/recipient', recipient.addRecipient);
    app.delete('/recipient/:id', recipient.deleteRecipient);

    logger.info('Finished setting up routes', 'routes.js');
}