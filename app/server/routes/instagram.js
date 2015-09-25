var _ = require('lodash');
var async = require('async');
var express = require('express');
var logger = require('winston');
var moment = require('moment');
var router = express.Router();

var config = require('../../config');
var instagramController = require('../controllers/instagram');
var userModel = require('../models/users');

router.get('/:username/latest', function (req, res, next) {
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
                res.status(200).send(media);
            }
        });
    }
});

router.get('/:username/:month/:day', function (req, res, next) {
    var username = req.params.username;
    var month = req.params.month - 1;
    var day = req.params.day;

    var foundUser = userModel.getUser(username);
    if (!foundUser) {
        res.status(404).send('User not found');
    }
    else {
        var year = moment().year();
        var specifiedDate = moment([year, month, day]);

        instagramController.getHistoricalPicturesForWeekForUser(foundUser, specifiedDate, function (err, medias) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                res.status(200).send(medias);
            }
        });
    }
});

module.exports = router;