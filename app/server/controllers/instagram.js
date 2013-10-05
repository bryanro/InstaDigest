var app = module.parent.exports.app;
var logger = require('../modules/logger');
var instagram = require('instagram-node').instagram();
var Config = require('./config');
var User = require('./user');
var moment = require('moment');

var InstagramController = {};

InstagramController.initialize = function () {

    InstagramController.config = {};

    Config.getConfigValue('instagramRedirectUri', function (err, instagramRedirectUri) {
        if (err) {
            logger.error('Error getting instagramRedirectUri.', 'instagram initialize');
        }
        else if (!instagramRedirectUri) {
            logger.error('Error finding instagramRedirectUri.', 'instagram initialize');
        }
        else {
            logger.debug('Success finding instagramRedirectUri', 'instagram initialize');
            InstagramController.config.instagramRedirectUri = instagramRedirectUri;
        }
    });

    Config.getConfigValue('instagramClientId', function (err, instagramClientId) {
        if (err) {
            logger.error('Error getting instagramClientId.', 'instagram initialize');
        }
        else if (!instagramClientId) {
            logger.error('Error finding instagramClientId.', 'instagram initialize');
        }
        else {
            logger.debug('Success finding instagramClientId', 'instagram initialize');
            InstagramController.config.instagramClientId = instagramClientId;
        }
    });

    Config.getConfigValue('instagramClientSecret', function (err, instagramClientSecret) {
        if (err) {
            logger.error('Error getting instagramClientSecret.', 'instagram initialize');
        }
        else if (!instagramClientSecret) {
            logger.error('Error finding instagramClientSecret.', 'instagram initialize');
        }
        else {
            logger.debug('Success finding instagramClientSecret', 'instagram initialize');
            InstagramController.config.instagramClientSecret = instagramClientSecret;
        }
    });
}

InstagramController.authenticate = function (req, res) {
    instagram.use({
        client_id: InstagramController.config.instagramClientId,
        client_secret: InstagramController.config.instagramClientSecret
    });

    res.redirect(instagram.get_authorization_url(InstagramController.config.instagramRedirectUri));
}

InstagramController.authRedirect = function (req, res) {

    instagram.authorize_user(req.query.code, InstagramController.config.instagramRedirectUri, function (err, result) {
        if (err) {
            logger.error('Error with authorizing user: ' + err.body, 'authRedirect');
            // TODO: FIX THIS
            res.send('Error authorizing user: ' + err.body);
        } else {
            logger.debug('Successfully got access token.', 'authRedirect');
            //res.send('You made it!! ' + result.access_token);

            // save new user or update user's oauth token
            var newUserParams = {
                instagramOauthToken: result.access_token,
                instagramUsername: result.user.username,
                fullName: result.user.full_name,
                instagramId: result.user.id,
                instagramProfilePictureUrl: result.user.profile_picture
            };

            User.createOrUpdateUser(newUserParams, function (err, user) {
                if (err) {
                    logger.error('Error creating or updating new user: ' + err, 'authRedirect', result.user.username);
                    // TODO: FIX THIS
                    //res.send('Error creating or updating user.');
                    res.redirect('/');
                }
                else {
                    logger.debug('User created or updated successfully', 'authRedirect', user.instagramUsername);
                    req.session.auth = true;
                    req.session.user = user;
                    res.redirect('/');
                }
            });
        }
    });
}

InstagramController.getNewPicturesForUser = function (user, lastEmailAttemptTimestamp, callback) {
    logger.debug('Entering getNewPictures()', 'getNewPictures', user.instagramUsername);

    instagram.use({ access_token: user.instagramOauthToken });
    instagram.user_media_recent(user.instagramId, { min_timestamp: lastEmailAttemptTimestamp }, function (err, medias, pagination, limit) {
        if (err) {
            console.log('Error getting recent media from instagram: ' + err, 'getNewPicturesForUser', user.instagramUsername);
            callback(err);
        }
        else {
            logger.debug('Found ' + medias.length + ' media items', 'getNewPicturesForUser', user.instagramUsername);
            logger.debug('Limit is at: ' + limit, 'getNewPicturesForUser', user.instagramUsername);
            /*logger.debug('MEDIAS: ' + JSON.stringify(medias), 'getNewPicturesForUser', user.instagramUsername);
            logger.debug('PAGINATION: ' + JSON.stringify(pagination), 'getNewPicturesForUser', user.instagramUsername);
            logger.debug('LIMIT: ' + JSON.stringify(limit), 'getNewPicturesForUser', user.instagramUsername);*/

            callback(err, medias);
        }
    });
}

InstagramController.initialize();

module.exports = InstagramController;

logger.debug('instagram.js module loaded', 'instagram.js');