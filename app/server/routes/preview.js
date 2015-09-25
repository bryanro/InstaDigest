var _ = require('lodash');
var async = require('async');
var express = require('express');
var fs = require('fs');
var logger = require('winston');
var moment = require('moment');
var router = express.Router();

var config = require('../../config');
var instagramController = require('../controllers/instagram');
var userModel = require('../models/users');

router.get('/daily', function (req, res, next) {
    var startOfYesterday = moment().subtract(1, 'days').startOf('day');

    var medias = [];
    var users = userModel.getUsers();
    async.each(users, function (user, userCallback) {
        instagramController.getPicturesForUserFromMoment(user, startOfYesterday, function (err, media) {
            if (err) {
                userCallback(err);
            }
            else {
                if (media.length > 0) {
                    _.each(media, function (m) {
                        medias.push(m);
                    });
                }
                userCallback(null);
            }
        });
    }, function (asyncErr) {
        if (asyncErr) {
            res.status(500).send(asyncErr);
        }
        else {
            fs.readFile('./app/server/templates/dailyDigestTemplate.html', 'utf8', function (err, data) {
                if (err) {
                    logger.error('error reading dailyDigestTemplate file: ' + err);
                    res.status(500).send(err);
                }
                else {
                    var digestTemplateHtml = data;
                    var digestTemplate = _.template(digestTemplateHtml)({ medias: medias });
                    var html = '<html><head></head><body>';
                    html += digestTemplate;
                    html += '</body></html>';
                    res.status(200).send(html);
                }
            });
        }
    });
});

router.get('/weekly', function (req, res, next) {

    var startOfLastWeek = moment().subtract(7, 'days').startOf('isoweek');
    logger.info('processing weekly with start of last week: ' + startOfLastWeek.format('YYYY-MM-DD hh:mm a'));

    var users = userModel.getUsers();

    async.waterfall([
        function (asyncCallback) {
            instagramController.getHistoricalPicturesForWeekForUsers(users, startOfLastWeek, asyncCallback);
        },
        function (medias, asyncCallback) {
            fs.readFile('./app/server/templates/weeklyDigestTemplate.html', 'utf8', function (err, data) {
                if (err) {
                    logger.error('error reading weeklyDigestTemplate file: ' + err);
                    asyncCallback(err);
                }
                else {
                    var digestTemplateHtml = data;
                    var digestTemplate = _.template(digestTemplateHtml)({ medias: instagramController.consolidateMediaByYear(medias) });

                    var html = '<html><head></head><body>';
                    html += digestTemplate;
                    html += '</body></html>';
                    res.status(200).send(html);
                }
            });
        }
    ], function (waterfallErr) {
        res.status(500).send(waterfallErr);
    });
});

module.exports = router;