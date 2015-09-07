var express = require('express');
var logger = require('winston');
var moment = require('moment');
var router = express.Router();

var schedulerController = require('../controllers/scheduler');

router.post('/daily', function (req, res, next) {
    schedulerController.sendDailyDigestEmails(function (err, stats) {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.status(200).send(stats);
        }
    });
});

router.post('/weekly', function (req, res, next) {
    schedulerController.sendWeeklyDigestEmails(function (err, stats) {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.status(200).send(stats);
        }
    });
});

module.exports = router;