define([
  'backbone'
], function (Backbone) {
    var UserModel = Backbone.Model.extend({
        idAttribute: '_id',
        initialize: function () {
        },
        urlRoot: '/recipient'
    });

    return UserModel;
});