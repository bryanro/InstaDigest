define([
  'backbone',
  'models/recipient.model'
], function (Backbone, RecipientModel) {
    var ReceipientsCollection = Backbone.Collection.extend({
        model: RecipientModel,
        url: '/recipients',
        initialize: function () {
        }
    });

    return ReceipientsCollection;
});