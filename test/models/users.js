var _ = require('lodash');
var assert = require('chai').assert;
var logger = require('winston');
var mockery = require('mockery');

describe('Users Model', function () {

    var usersModel;

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

            var mockUsersJson = require('../mocks/config/instagramusers.json');
            mockery.registerMock('../config/instagramusers.json', mockUsersJson);
            usersModel = require('../../app/server/models/users');

            done();
        });

        it('should return all instagram users from getUsers', function (done) {
            var users = usersModel.getUsers();
            assert.equal(users.length, 2, 'there are 2 total recipients');
            done();
        });

        it('should return the instagram user searched for using getUser', function (done) {
            var user = usersModel.getUser('instagram2');
            assert.equal(user.instagramUsername, 'instagram2', 'email matches');
            assert.equal(user.fullName, 'instagram 2', 'full name matches');
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

            var mockUsersJson = [];
            mockery.registerMock('../config/instagramusers.json', mockUsersJson);
            usersModel = require('../../app/server/models/users');

            done();
        });

        it('should return an empty array from getUsers when there are no users', function (done) {
            var users = usersModel.getUsers();
            assert.equal(users.length, 0, 'there are 0 total users');
            done();
        });

        it('should return undefined for a user that does not exist from getUser', function (done) {
            var user = usersModel.getUser('foo@bar.com');
            assert.isUndefined(user, 'recipient is undefined because email was not found');
            done();
        });
    });
});