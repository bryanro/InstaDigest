define([
  'jquery',
  'underscore',
  'backbone',
  './header-unauthenticated.view',
  'text!./unauthenticated.html'
], function ($, _, Backbone, HeaderView, UnauthenticatedTemplate) {

    var UnauthenticatedView = Backbone.View.extend({

        el: $('body'),

        initialize: function (options) {
            this.headerView = new HeaderView();
        },

        render: function () {
            this.headerView.render();
            this.unauthenticatedTemplate = _.template(UnauthenticatedTemplate);
            $('#main-container').html(this.unauthenticatedTemplate({}));
        },

        events: {
        }
    });

    return UnauthenticatedView;
});