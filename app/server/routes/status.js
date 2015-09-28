var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.status(200).send('API is running');
});

router.get('/version/', function (req, res, next) {
    var packageDotJson = require('../../../package.json');
    res.status(200).send('Version ' + packageDotJson.version);
});

module.exports = router;