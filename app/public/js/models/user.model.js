define([
  'backbone'
], function (Backbone) {
    var UserModel = Backbone.Model.extend({
        idAttribute: 'instagramUsername',
        initialize: function () {
        },
        urlRoot: '/user'
    });

    return UserModel;
});