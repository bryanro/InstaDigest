var _ = require('lodash');
var async = require('async');
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

InstagramController.getPicturesForUserFromMoment = function (user, fromMoment, callback) {
    // default to 1 day later
    var toMoment = moment(fromMoment).add(1, 'days');
    InstagramController.getPicturesForUserFromMomentToMoment(user, fromMoment, toMoment, callback);
}

InstagramController.getPicturesForUserFromMoment = function (user, fromMoment, callback) {
    // default to 1 day later
    var toMoment = moment(fromMoment).add(1, 'days');
    InstagramController.getPicturesForUserFromMomentToMoment(user, fromMoment, toMoment, callback);
}

InstagramController.getPicturesForUserFromMomentToMoment = function (user, fromMoment, toMoment, callback) {
    var fromTimestamp = moment(fromMoment).format('X');
    var toTimestamp = moment(toMoment).format('X');
    logger.debug('getPicturesForUserFromMomentToMoment - fromTimestamp: ' + fromTimestamp + ' (' + moment(fromMoment).toISOString() + ') - toTimestamp: ' + toTimestamp + ' (' + moment(toMoment).toISOString() + ')');
    instagram.use({ access_token: user.instagramOauthToken });
    instagram.user_media_recent(user.instagramId, { min_timestamp: fromTimestamp, max_timestamp: toTimestamp }, function (err, medias, pagination, limit) {
        if (err) {
            logger.error('error getting recent media from instagram: ' + err);
            callback(err);
        }
        else {
            logger.info('found ' + medias.length + ' media items for ' + user.instagramUsername);
            logger.debug('limit is at: ' + limit + ' for ' + user.instagramUsername);
            callback(null, medias);
        }
    });
}

InstagramController.getHistoricalPicturesForWeekForUsers = function (users, dateMoment, callback) {
    var medias = [];

    async.each(users, function (user, asyncCallback) {
        InstagramController.getHistoricalPicturesForWeekForUser(user, dateMoment, function (err, media) {
            if (err) {
                asyncCallback(err);
            }
            else {
                if (media.length > 0) {
                    _.each(media, function (m) {
                        medias.push(m);
                    });
                }
                asyncCallback(null);
            }
        });
    }, function (asyncErr) {
        callback(asyncErr, medias);
    });
}

InstagramController.getHistoricalPicturesForWeekForUser = function (user, dateMoment, callback) {
    var month = moment(dateMoment).month();
    var day = moment(dateMoment).date();

    // start with this year
    var year = moment().year();

    var medias = [];

    async.whilst(function () {
        return config.weeklyDigest && config.weeklyDigest.enabled && year >= config.weeklyDigest.minYear;
    }, function (asyncCallback) {
        logger.debug('iteration: ' + year);
        var weekStartInPast = moment([year, month, day]);
        var weekEndInPast = moment(weekStartInPast).add(1, 'weeks');
        InstagramController.getPicturesForUserFromMomentToMoment(user, weekStartInPast, weekEndInPast, function (err, media) {
            if (err) {
                asyncCallback(err);
            }
            else {
                if (media.length > 0) {
                    var m = {
                        instagramUsername: user.instagramUsername,
                        year: year,
                        medias: media
                    };
                    medias.push(m);
                }
                year--;
                asyncCallback(null);
            }
        });
    }, function (whilstErr) {
        if (whilstErr) {
            callback(whilstErr);
        }
        else {
            callback(null, medias);
        }
    });
}

InstagramController.consolidateMediaByYear = function (medias) {
    // group all instagram users' together for each year
    var yearsToProcess = _.chain(medias)
        .pluck('year')
        .uniq()
        .sortBy(function (val) {
            return val;
        })
        .value();

    var filteredMediasByYear = [];
    _.each(yearsToProcess, function (eachYear) {
        var yearMedias = {
            year: eachYear,
            medias: []
        };
        _.each(medias, function (fm) {
            if (fm.year == eachYear) {
                _.each(fm.medias, function (m) {
                    yearMedias.medias.push(m);
                });
            }
        });
        filteredMediasByYear.push(yearMedias);
    });

    // sort filteredMediasByYear and the medias inside them by date descending
    filteredMediasByYear = _.sortBy(filteredMediasByYear, function (f) {
        return f.year * -1;
    });
    _.each(filteredMediasByYear, function (f) {
        f.medias = _.sortBy(f.medias, function (m) {
            return moment(m.created_time, 'X').valueOf() * -1;
        });
    });

    return filteredMediasByYear;
}

module.exports = InstagramController;