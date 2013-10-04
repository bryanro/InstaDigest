define([
  'jquery',
  'underscore',
  'backbone',
  'text!./header-authenticated.html'
], function ($, _, Backbone, HeaderTemplate) {

    var HeaderView = Backbone.View.extend({

        el: $('header'),

        initialize: function (options) {
            this.user = options.user;
        },

        render: function () {
            this.headerTemplate = _.template(HeaderTemplate);
            this.$el.html(this.headerTemplate({ user: this.user }));
        },

        events: {
        },

        SetPageName: function (pageName) {
            this.pageName = pageName;
        }
    });

    return HeaderView;
});