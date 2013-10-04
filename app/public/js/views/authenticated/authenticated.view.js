define([
  'jquery',
  'underscore',
  'backbone',
  'collections/recipients.collection',
  './header-authenticated.view',
  './manage-recipients/manage-recipients.view',
  'text!./authenticated.html'
], function ($, _, Backbone, RecipientsCollection, HeaderView, ManageRecipientsView, AuthenticatedTemplate) {

    var UnauthenticatedView = Backbone.View.extend({

        el: $('body'),

        initialize: function (options) {
            var that = this;
            this.user = options.user;
            this.recipientsCollection = new RecipientsCollection();
            this.recipientsCollection.fetch({
                success: function (model, result, options) {
                    that.recipientsCollection.trigger('fetched');
                },
                error: function (model, xhr, options) {
                    console.log('error');
                }
            });

            this.recipientsCollection.on('fetched', this.recipientsCollectionFetched, this);

            this.headerView = new HeaderView({ user: this.user });
        },

        render: function () {
            var authenticatedTemplate = _.template(AuthenticatedTemplate);
            $('#main-container').html(authenticatedTemplate({}));
            this.headerView.render();
        },

        recipientsCollectionFetched: function () {
            var that = this;
            this.manageRecipientsView = new ManageRecipientsView({ user: that.user, recipients: that.recipientsCollection });
            this.manageRecipientsView.render();
        },

        events: {
        }
    });

    return UnauthenticatedView;
});