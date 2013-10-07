var app = module.parent.exports.app;
var logger = require('../modules/logger');
var instagram = require('instagram-node').instagram();
var Config = require('./config');
var User = require('./user');
var moment = require('moment');
var $ = require('jquery');

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

    Config.getConfigValue('betaPassword', function (err, betaPassword) {
        if (err) {
            logger.error('Error getting betaPassword.', 'instagram initialize');
        }
        else if (!betaPassword) {
            logger.error('Error finding betaPassword.', 'instagram initialize');
        }
        else {
            logger.debug('Success finding betaPassword', 'instagram initialize');
            InstagramController.config.betaPassword = betaPassword;
        }
    });
}

InstagramController.authenticate = function (req, res) {
    logger.debug('Entering instagram.authenticate()', 'instagram.authenticate');

    var buildAuthUrl = 'https://api.instagram.com/oauth/authorize/?client_id=';
    buildAuthUrl += InstagramController.config.instagramClientId;
    buildAuthUrl += '&redirect_uri=';
    buildAuthUrl += InstagramController.config.instagramRedirectUri;
    buildAuthUrl += '&response_type=code';

    res.redirect(buildAuthUrl);
}

InstagramController.authRedirect = function (req, res) {
    logger.debug('Entering authRedirect()', 'authRedirect');

    var authCode = req.query.code;
    $.ajax({
        type: 'POST',
        url: 'https://api.instagram.com/oauth/access_token',
        data: {
            client_id: InstagramController.config.instagramClientId,
            client_secret: InstagramController.config.instagramClientSecret,
            grant_type: 'authorization_code',
            redirect_uri: InstagramController.config.instagramRedirectUri,
            code: authCode
        },
        success: function (data, status, xhr) {
            logger.debug('Success posting access_token', 'authRedirect');

            // save new user or update user's oauth token
            var newUserParams = {
                instagramOauthToken: data.access_token,
                instagramUsername: data.user.username,
                fullName: data.user.full_name,
                instagramId: data.user.id,
                instagramProfilePictureUrl: data.user.profile_picture
            };

            User.createOrUpdateUser(newUserParams, function (err, user) {
                if (err) {
                    logger.error('Error creating or updating new user: ' + err, 'authRedirect', result.user.username);
                    res.redirect('/');
                }
                else {
                    logger.debug('User created or updated successfully', 'authRedirect', user.instagramUsername);
                    req.session.auth = true;
                    req.session.user = user;
                    res.redirect('/');
                }
            });
        },
        error: function (xhr, status, error) {
            if (xhr && xhr.responseText && xhr.responseText.error_message) {
                logger.error('Error posting access_token: ' + xhr.responseText.error_message, 'authRedirect');
            }
            else {
                logger.error('Error posting access_token, xhr: ' + JSON.stringify(xhr), 'authRedirect');
            }
            res.redirect('/#auth-error');
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