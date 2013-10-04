﻿var mongoose = require('mongoose');
var app = module.parent.exports.app;
var UserModel = mongoose.model('User');
var Config = require('./config');
var logger = require('../modules/logger');
var _ = require('underscore');

var UserController = {};

UserController.createOrUpdateUser = function (newUserParams, callback) {
    logger.debug('Entering createOrUpdateUser()', 'createOrUpdateUser', newUserParams.instagramUsername);

    UserModel.findOne({ instagramUsername: newUserParams.instagramUsername }, function (err, existingUser) {
        if (err) {
            logger.error('Error validating instagramUsername does not already exist: ' + err, 'createOrUpdateUser', newUserParams.instagramUsername);
            callback(err);
        }
        else if (existingUser) {
            logger.info('Found existing user with same instagramUsername, so just update oauth token', 'createOrUpdateUser', newUserParams.instagramUsername);
            //callback('User already exists');
            existingUser.updateInstagramOauthToken(newUserParams.instagramOauthToken, function (err, updatedUser) {
                if (err) {
                    logger.error('Error saving new instagramOauthToken: ' + err, 'updateInstagramOauthToken', newUserParams.instagramUsername);
                    callback(err);
                }
                else {
                    logger.debug('Successfully updated new instagramOauthToken', 'updateInstagramOauthToken', newUserParams.instagramUsername);
                    callback(null, updatedUser);
                }
            });
        }
        else {
            logger.debug('instagramUsername does not already exist so proceed with creating new user', 'createOrUpdateUser', newUserParams.instagramUsername);
            var user = new UserModel({
                instagramUsername: newUserParams.instagramUsername,
                fullName: newUserParams.fullName,
                instagramOauthToken: newUserParams.instagramOauthToken,
                instagramId: newUserParams.instagramId,
                instagramProfilePictureUrl: newUserParams.instagramProfilePictureUrl
            });
            user.save(function (err, user) {
                if (err) {
                    logger.error('Error creating new username: ' + err);
                    callback(err);
                }
                else {
                    logger.debug('Successfully created new user', 'createOrUpdateUser', user.instagramUsername);
                    //res.send(201, user);
                    callback(null, user);
                }
            });
        }
    });
}

UserController.updateInstagramOauthToken = function (instagramUsername, newOauthToken, callback) {
    logger.debug('Entering updateInstagramOauthToken()', 'updateInstagramOauthToken', instagramUsername);

    UserModel.findOne({ instagramUsername: instagramUsername }, function (err, user) {
        if (err) {
            logger.error('Error looking up username: ' + err, 'updateInstagramOauthToken', instagramUsername);
            callback(err);
        }
        else if (!existingUser) {
            logger.error('Error finding existing user', 'updateInstagramOauthToken', instagramUsername);
            callback('Error finding user');
        }
        else {
            user.updateInstagramOauthToken(newOauthToken, function (err, updatedUser) {
                if (err) {
                    logger.error('Error saving new instagramOauthToken: ' + err, 'updateInstagramOauthToken', instagramUsername);
                    callback(err);
                }
                else {
                    logger.debug('Successfully updated new instagramOauthToken', 'updateInstagramOauthToken', instagramUsername);
                    callback(null, updatedUser);
                }
            });
        }
    });
}

UserController.getAllUsers = function (callback) {
    logger.debug('Entering getAllUsers()', 'getAllUsers');

    UserModel.find({}, function (err, users) {
        if (err) {
            logger.error('Error getting all users: ' + err, 'getAllUsers');
            callback(err);
        }
        else {
            logger.debug('Success finding all users', 'getAllUsers');
            callback(null, users);
        }
    })
}

UserController.getInstagramUsernameFromSession = function (req, callback) {
    logger.debug('Entering getInstagramUsernameFromSession()', 'getInstagramUsernameFromSession');
    if (!(req.session && req.session.auth && req.session.user)) {
        logger.error('Unauthorized attempt', 'getInstagramUserIdFromSession');
        callback('Unauthorized');
    }
    else {
        var instagramUsername = req.session.user.instagramUsername;
        logger.debug('Successfully retrieved instagramUsername', 'getInstagramUsernameFromSession', instagramUsername);
        callback(null, instagramUsername);
    }
}

UserController.getUser = function (req, res) {

    logger.debug('Entering getUser()', 'getUser');

    if (!(req.session && req.session.auth)) {
        logger.error('Unauthorized attempt', 'getUser');
        res.send(201, 'Unauthorized');
    }
    else {
        var instagramUsername = req.session.user.instagramUsername;

        UserModel.findOne({ instagramUsername: instagramUsername }, function (err, user) {
            if (err) {
                logger.error('Error finding user: ' + err, 'getUser', email);
                res.send(500, 'Error finding user.');
            }
            else if (!user) {
                logger.error('User not found', 'getUser', instagramUsername);
                res.send(400, 'User not found');
            }
            else {
                logger.debug('User found', 'getUser', instagramUsername);
                res.send(200, {
                    instagramUsername: user.instagramUsername,
                    instagramId: user.instagramId,
                    fullName: user.fullName,
                    instagramProfilePictureUrl: user.instagramProfilePictureUrl,
                    createdDate: user.createdDate,
                    lastUpdatedDate: user.lastUpdatedDate,
                    lastLoginDate: user.lastLoginDate,
                    lastEmailSuccessfullySent: user.lastEmailSuccessfullySent
                });
            }
        });
    }
}

UserController.getUserInfo = function (instagramUsername, callback) {
    logger.debug('Entering getUserInfo()', 'getUserInfo', instagramUsername);
    UserModel.findOne({ instagramUsername: instagramUsername }, function (err, user) {
        if (err) {
            logger.error('Error finding user: ' + err, 'getUserInfo', email);
            callback(err);
        }
        else {
            logger.debug('User found', 'getUserInfo', instagramUsername);
            callback(null, user);
        }
    });
}

module.exports = UserController;

logger.debug('user.js controller loaded', 'user.js');