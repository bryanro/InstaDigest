var _ = require('lodash');
var express = require('express');
var fs = require('fs');
var logger = require('winston');
var moment = require('moment');
var router = express.Router();

var config = require('../../config');
var instagramController = require('../controllers/instagram');
var userModel = require('../models/users');

router.get('/daily/:username', function (req, res, next) {
    var username = req.params.username;
    var foundUser = userModel.getUser(username);
    if (!foundUser) {
        res.status(404).send('User not found');
    }
    else {
        var yesterday = moment().subtract(1, 'days').startOf('day');
        instagramController.getPicturesForUserFromMoment(foundUser, yesterday, function (err, media) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                fs.readFile('./app/server/templates/emailTemplate.html', 'utf8', function (err, data) {
                    if (err) {
                        logger.error('error reading emailTemplate file: ' + err);
                        asyncCallback(err);
                    }
                    else {
                        var digestTemplateHtml = data;
                        var digestTemplate = _.template(digestTemplateHtml)({ user: foundUser, medias: media });

                        var html = '<html><head></head><body>';
                        html += digestTemplate;
                        html += '</body></html>';
                        res.status(200).send(html);
                    }
                });
            }
        });
    }
});

router.get('/weekly/:username', function (req, res, next) {
    var username = req.params.username;
    var foundUser = userModel.getUser(username);
    if (!foundUser) {
        res.status(404).send('User not found');
    }
    else {
        var yesterday = moment().subtract(1, 'days').startOf('day');
        instagramController.getHistoricalPicturesForWeek(foundUser, yesterday, function (err, media) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                fs.readFile('./app/server/templates/weeklyDigestTemplate.html', 'utf8', function (err, data) {
                    if (err) {
                        logger.error('error reading weeklyDigestTemplate file: ' + err);
                        asyncCallback(err);
                    }
                    else {
                        var digestTemplateHtml = data;
                        var digestTemplate = _.template(digestTemplateHtml)({ user: foundUser, medias: media });

                        var html = '<html><head></head><body>';
                        html += digestTemplate;
                        html += '</body></html>';
                        res.status(200).send(html);
                    }
                });
            }
        });
    }
});

module.exports = router;