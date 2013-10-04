var mongoose = require('mongoose');
var app = module.parent.exports.app;
var RecipientModel = mongoose.model('Recipient');
var UserController = require('../controllers/user');
var Config = require('./config');
var logger = require('../modules/logger');

var RecipientController = {};

RecipientController.getRecipientsForUser = function (instagramUser, callback) {
    RecipientModel.find({ instagramUser: instagramUser._id }, function (err, recipients) {
        if (err) {
            logger.error('Error getting ricipients: ' + err, 'getRecipientsForUser', instagramUser.instagramUsername);
            callback(err);
        }
        else {
            logger.debug('Successfully found ' + recipients.length + ' recipients', 'getRecipientsForUser', instagramUser.instagramUsername);
            callback(null, recipients);
        }
    });
}

RecipientController.getRecipients = function (req, res) {
    logger.debug('Entering getRecipients()', 'getRecipients');
    UserController.getInstagramUsernameFromSession(req, function (err, instagramUsername) {
        if (err) {
            logger.error('Error getting instagram username from session: ' + err, 'getRecipients');
            res.send(500, err);
        }
        else {
            UserController.getUserInfo(instagramUsername, function (err, user) {
                if (err) {
                    logger.error('Error getting user: ' + err, 'getRecipients');
                    res.send(500, err);
                }
                else {
                    logger.debug('Successfully found user', 'getRecipients', user.instagramUsername);
                    RecipientController.getRecipientsForUser(user, function (err, recipients) {
                        if (err) {
                            logger.error('Error getting recipients: ' + err, 'getRecipients', user.instagramUser);
                            res.send(500, 'Error getting recipients: ' + err);
                        }
                        else {
                            logger.debug('Successfully found ' + recipients.length + ' receipients', 'getRecipients', user.instagramUser);
                            res.send(200, recipients);
                        }
                    });
                }
            });
        }
    });
}

RecipientController.addRecipient = function (req, res) {

    var recipientEmail = req.body.email;

    logger.debug('Entering addRecipient()', 'addRecipient');
    UserController.getInstagramUsernameFromSession(req, function (err, instagramUsername) {
        if (err) {
            logger.error('Error getting instagram username from session: ' + err, 'addRecipient');
            res.send(500, err);
        }
        else {
            UserController.getUserInfo(instagramUsername, function (err, user) {
                if (err) {
                    logger.error('Error getting user: ' + err, 'addRecipient');
                    res.send(500, err);
                }
                else {
                    logger.debug('Successfully found user', 'addRecipient', user.instagramUsername);
                    RecipientModel.find({ instagramUser: user._id, email: recipientEmail }, function (err, existingRecipient) {
                        if (err) {
                            logger.error('Error checking if existing recipient with same email: ' + recipientEmail, 'addRecipient', user.instagramUsername);
                            res.send(500, err);
                        }
                        else if (existingRecipient.length > 0) {
                            logger.warn('Existing recipient email already exists for user: ' + recipientEmail, 'addRecipient', user.instagramUsername);
                            res.send(400, 'Email already added');
                        }
                        else {
                            logger.debug('Existing recipient does not exist with same email, proceed with creating new recipient for user', 'addRecipient', user.instagramUsername);
                            var newRecipient = new RecipientModel({
                                email: recipientEmail,
                                instagramUser: user
                            });
                            newRecipient.save(function (err, savedRecipient) {
                                if (err) {
                                    logger.error('Error saving new recipient: ' + recipientEmail, 'addRecipient', user.instagramUsername);
                                }
                                else {
                                    logger.debug('Successfully saved new recipient: ' + recipientEmail, 'addRecipient', user.instagramUsername);
                                    res.send(201, savedRecipient);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

RecipientController.deleteRecipient = function (req, res) {
    logger.debug('Entering deleteRecipient()', 'deleteRecipient');

    var recipientId = req.params.id;

    UserController.getInstagramUsernameFromSession(req, function (err, instagramUsername) {
        if (err) {
            logger.error('Error getting instagram username from session: ' + err, 'deleteRecipient');
            res.send(500, err);
        }
        else {
            UserController.getUserInfo(instagramUsername, function (err, user) {
                if (err) {
                    logger.error('Error getting user: ' + err, 'deleteRecipient');
                    res.send(500, err);
                }
                else {
                    logger.debug('Successfully found user', 'deleteRecipient', user.instagramUsername);
                    RecipientModel.findById(recipientId, function (err, recipient) {
                        if (err) {
                            logger.error('Error getting recipient with id: ' + recipientId, 'deleteRecipient');
                            res.send(500, err);
                        }
                        else if (!recipient) {
                            logger.error('Error finding recipient with id: ' + recipientId, 'deleteRecipient');
                            res.send(500, err);
                        }
                        else {
                            recipient.remove(function (err) {
                                if (err) {
                                    logger.error('Error removing recipient with id: ' + recipientId, 'deleteRecipient');
                                    res.send(500, err);
                                }
                                else {
                                    logger.debug('Success deleting recipient with id: ' + recipientId, 'deleteRecipient');
                                    res.send(204);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

module.exports = RecipientController;

logger.debug('recipient.js loaded', 'recipient.js');