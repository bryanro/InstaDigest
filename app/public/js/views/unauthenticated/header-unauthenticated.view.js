define([
  'jquery',
  'underscore',
  'backbone',
  'text!./header-unauthenticated.html'
], function ($, _, Backbone, HeaderTemplate) {

    var HeaderView = Backbone.View.extend({

        el: $('header'),

        initialize: function (options) {
        },

        render: function () {
            this.headerTemplate = _.template(HeaderTemplate);
            this.$el.html(this.headerTemplate({}));
        },

        events: {
        }
    });

    return HeaderView;
});