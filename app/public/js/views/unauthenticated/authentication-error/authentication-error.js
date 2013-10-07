define([
  'jquery',
  'underscore',
  'backbone',
  'text!./authentication-error.html'
], function ($, _, Backbone, AuthErrorTemplate) {

    var AuthenticationErrorView = Backbone.View.extend({

        el: $('#main-container'),

        initialize: function (options) {
        },

        render: function () {
            this.authErrorTemplate = _.template(AuthErrorTemplate);
            this.$el.html(this.authErrorTemplate({}));
        },

        events: {
        }
    });

    return AuthenticationErrorView;
});