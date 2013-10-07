define([
  'jquery',
  'underscore',
  'backbone',
  'models/user.model',
  'collections/recipients.collection',
  'views/authenticated/header-authenticated.view',
  'views/authenticated/manage-recipients/manage-recipients.view',
  'views/unauthenticated/header-unauthenticated.view',
  'views/unauthenticated/unauthenticated.view',
  'views/authenticated/authenticated.view',
  'views/unauthenticated/authentication-error/authentication-error'
], function ($, _, Backbone, UserModel, RecipientsCollection, AuthenticatedHeaderView, ManageRecipientsView, UnauthenticatedHeaderView, UnauthenticatedView, AuthenticatedView, AuthenticationErrorView) {

    var thisRouter;

    var Router = Backbone.Router.extend({

        initialize: function () {
        },

        routes: {
            // Define some URL routes
            'login': 'showUnauthenticated',
            'auth-error': 'showAuthenticationError',

            // Default
            '*actions': 'showAuthenticated'
        },

        showUnauthenticated: function () {
            this.unauthenticatedView = new UnauthenticatedView();
            this.unauthenticatedView.render();
            this.unauthenticatedHeaderView = new UnauthenticatedHeaderView({});
            this.unauthenticatedHeaderView.render();
        },

        showAuthenticationError: function () {
            this.authenticationErrorView = new AuthenticationErrorView();
            this.authenticationErrorView.render();
            this.unauthenticatedHeaderView = new UnauthenticatedHeaderView({});
            this.unauthenticatedHeaderView.render();
        },

        showAuthenticated: function () {
            // TODO: Create an authenticated view to manage the sub-views
            var that = this;
            this.user = new UserModel();
            this.user.fetch({
                success: function (model, result, options) {
                    that.authenticatedView = new AuthenticatedView({ user: that.user });
                    that.authenticatedView.render();
                },
                error: function (model, xhr, options) {
                    window.location.hash = 'login';
                }
            });
        }
    });

    var initialize = function () {
        var app_router = new Router();
        Backbone.history.start();
    };

    return {
        initialize: initialize
    };
});