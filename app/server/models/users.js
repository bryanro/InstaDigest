var _ = require('lodash');
var logger = require('winston');

var userConfig = require('../config/instagramusers.json');

var UserModel = {};

UserModel.getUsers = function () {
    return userConfig;
}

UserModel.getUser = function (username) {
    return _.findWhere(UserModel.getUsers(), { instagramUsername: username });
}

module.exports = UserModel;