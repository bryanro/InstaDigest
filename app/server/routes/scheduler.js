var express = require('express');
var logger = require('winston');
var moment = require('moment');
var router = express.Router();

var schedulerController = require('../controllers/scheduler');

router.post('/manual', function (req, res, next) {
    schedulerController.sendDigestEmails(function (err, stats) {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.status(200).send(stats);
        }
    });
});

module.exports = router;