var mongoose = require('mongoose');
var logger = require('../modules/logger');

var UserSchema = new mongoose.Schema({
    instagramUsername: { type: String, required: true, unique: true },
    fullName: { type: String, required: false },
    instagramOauthToken: { type: String, required: false },
    instagramId: { type: String, required: false },
    instagramProfilePictureUrl: { type: String, required: false },
    createdDate: { type: Date, default: Date.now },
    lastUpdatedDate: { type: Date, default: Date.now },
    lastLoginDate: { type: Date, default: Date.now },
    lastEmailAttemptDate: { type: Date },
    lastEmailSuccessfullySentDate: { type: Date }
});

/*UserSchema.pre('save', function (next) {
    var user = this;

    user.lastUpdatedDate = Date.now();
    user.save(function (err, savedUser) {
        if (err) {
            logger.error('Error pre-saving user: ' + err, 'UserSchema.pre(save)', user.instagramUsername);
            next(err);
        }
        else {
            logger.debug('Successfully updated lastUpdateDateTime for user', 'UserSchema.pre(save)', user.instagramUsername);
            next();
        }
    });
});*/

UserSchema.methods.updateInstagramOauthToken = function (newOauthToken, callback) {
    var user = this;
    if (newOauthToken) {
        logger.debug('Entering updateInstagramOauthToken', 'UserSchema.updateInstagramOauthToken', user.instagramUsername);
        if (user.instagramOauthToken !== newOauthToken) {
            logger.debug('New instagramOauthToken does not match existing, so update', 'UserSchema.updateInstagramOauthToken', user.instagramUsername);
            //user.lastUpdatedDate = Date.now();
            user.instagramOauthToken = newOauthToken;
        }
        user.lastLoginDate = Date.now();
        user.save(callback); // callback(err, savedUser);
    }
    else {
        logger.error('newOauthToken is undefined', 'UserSchema.updateInstagramOauthToken', user.instagramUsername);
        callback('newOauthToken is undefined');
    }
}

UserSchema.methods.updatelastEmailAttempt = function (newLastEmailAttempt, callback) {
    var user = this;
    if (newLastEmailAttempt) {
        logger.debug('Entering updatelastEmailAttempt', 'UserSchema.updatelastEmailAttempt', user.instagramUsername);
        user.lastEmailAttempt = newLastEmailAttempt;
        user.save(callback);
    }
    else {
        logger.error('newLastEmailAttempt is undefined', 'UserSchema.updatelastEmailAttempt', user.instagramUsername);
        callback('newLastEmailAttempt is undefined');
    }
}

mongoose.model('User', UserSchema);

logger.debug('users.js model loaded', 'users.js');