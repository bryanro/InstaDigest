var express = require('express');
var logger = require('winston');
var moment = require('moment');
var router = express.Router();

var instagramController = require('../controllers/instagram');
var userModel = require('../models/users');

router.get('/:username/latest', function (req, res, next) {
    var username = req.params.username;
    var foundUser = userModel.getUser(username);
    if (!foundUser) {
        res.status(404).send('User not found');
    }
    else {
        var yesterdayTimestamp = moment('2015-08-15').subtract(1, 'days').format('X');
        //var yesterdayTimestamp = moment().subtract(1, 'days').format('X');
        instagramController.getNewPicturesForUser(foundUser, yesterdayTimestamp, function (err, media) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                res.status(200).send(media);
            }
        });
    }
});

module.exports = router;