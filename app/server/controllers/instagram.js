var instagram = require('instagram-node').instagram();
var logger = require('winston');
var moment = require('moment');
var rest = require('restler');

var config = require('../../config');

var InstagramController = {};

InstagramController.authenticate = function (req, res, next) {
    var buildAuthUrl = 'https://api.instagram.com/oauth/authorize/?client_id=';
    buildAuthUrl += config.instagramApi.instagramClientId;
    buildAuthUrl += '&redirect_uri=';
    buildAuthUrl += config.instagramApi.instagramRedirectUri;
    buildAuthUrl += '&response_type=code';

    res.redirect(buildAuthUrl);
}

InstagramController.authRedirect = function (req, res, next) {
    var authCode = req.query.code;

    var url = 'https://api.instagram.com/oauth/access_token';
    rest.post(url, {
        data: {
            client_id: config.instagramApi.instagramClientId,
            client_secret: config.instagramApi.instagramClientSecret,
            grant_type: 'authorization_code',
            redirect_uri: config.instagramApi.instagramRedirectUri,
            code: authCode
        },
        success: function (model, status, xhr) {
            logger.debug('success posting access_token');
            var user = {
                oAuthToken: model.access_token,
                id: model.user.id,
                username: model.user.username,
                fullName: model.user.full_name
            };
            logger.info(JSON.stringify(user));
            res.status(200).send(user);
        },
        error: function (xhr, status, error) {
            logger.error(status);
            res.status(500).send('unable to authenticate');
        }
    });
}

InstagramController.getNewPicturesForUser = function (user, fromTimestamp, callback) {
    instagram.use({ access_token: user.instagramOauthToken });
    instagram.user_media_recent(user.instagramId, { min_timestamp: fromTimestamp }, function (err, medias, pagination, limit) {
        if (err) {
            logger.error('error getting recent media from instagram: ' + err);
            callback(err);
        }
        else {
            logger.info('found ' + medias.length + ' media items for ' + user.instagramUsername);
            logger.debug('limit is at: ' + limit, 'getNewPicturesForUser', user.instagramUsername);
            callback(null, medias);
        }
    });
}

module.exports = InstagramController;