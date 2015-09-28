var _ = require('lodash');
var assert = require('chai').assert;
var logger = require('winston');
var mockery = require('mockery');

describe('Recipients Model', function () {

    var recipientsModel;

    afterEach(function (done) {
        mockery.disable();
        done();
    });

    describe('positive tests', function () {
        before(function (done) {
            mockery.enable({
                useCleanCache: true,
                warnOnReplace: true,
                warnOnUnregistered: false
            });

            var mockRecipientsJson = require('../mocks/config/recipients.json');
            mockery.registerMock('../config/recipients.json', mockRecipientsJson);
            recipientsModel = require('../../app/server/models/recipients');

            done();
        });

        it('should return all recipients from getRecipients', function (done) {
            var recipients = recipientsModel.getRecipients();
            assert.equal(recipients.length, 6, 'there are 6 total recipients');

            var recipient = recipients[0];
            assert.isNotNull(recipient.email, 'email exists');
            assert.isNotNull(recipient.dailyDigest, 'dailyDigest exists');
            assert.isNotNull(recipient.weeklyDigest, 'weeklyDigest exists');
            assert.isNotNull(recipient.instagramUsers, 'instagramUsers array exists');
            done();
        });

        it('should return all daily digest recipients from getDailyDigestRecipients', function (done) {
            var recipients = recipientsModel.getDailyDigestRecipients();
            assert.equal(recipients.length, 4, 'there are 4 daily digest recipients');
            done();
        });

        it('should return all weekly digest recipients from getWeeklyDigestRecipients', function (done) {
            var recipients = recipientsModel.getWeeklyDigestRecipients();
            assert.equal(recipients.length, 3, 'there are 3 daily digest recipients');
            done();
        });

        it('should return the recipient searched for using getRecipient', function (done) {
            var recipient = recipientsModel.getRecipient('email3@email.com');
            assert.equal(recipient.email, 'email3@email.com', 'email matches');
            assert.isFalse(recipient.dailyDigest, 'dailyDigest flag is false');
            assert.isTrue(recipient.weeklyDigest, 'weeklyDigest flag is true');
            assert.equal(recipient.instagramUsers.length, 3, '3 instagram users for recipient');
            done();
        });
    });

    describe('negative tests', function () {

        before(function (done) {
            mockery.enable({
                useCleanCache: true,
                warnOnReplace: true,
                warnOnUnregistered: false
            });

            var mockRecipientsJson = [];
            mockery.registerMock('../config/recipients.json', mockRecipientsJson);
            recipientsModel = require('../../app/server/models/recipients');

            done();
        });

        it('should return an empty array from getRecipients with no recipients', function (done) {
            var recipients = recipientsModel.getRecipients();
            assert.equal(recipients.length, 0, 'there are 0 total recipients');
            done();
        });

        it('should return an empty array from getDailyDigestRecipients with no recipients', function (done) {
            var recipients = recipientsModel.getDailyDigestRecipients();
            assert.equal(recipients.length, 0, 'there are 0 daily digest recipients');
            done();
        });

        it('should return an empty array from getWeeklyDigestRecipients with no recipients', function (done) {
            var recipients = recipientsModel.getWeeklyDigestRecipients();
            assert.equal(recipients.length, 0, 'there are 0 daily digest recipients');
            done();
        });

        it('should return an undefined object when searching for a user that does not exist using getRecipient', function (done) {
            var recipient = recipientsModel.getRecipient('foo@bar.com');
            assert.isUndefined(recipient, 'recipient is undefined because email was not found');
            done();
        });
    });
});