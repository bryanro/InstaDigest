define([
  'jquery',
  'underscore',
  'backbone',
  'util/util',
  'models/recipient.model',
  'text!./confirm-remove-recipient.html'
], function ($, _, Backbone, Util, RecipientModel, ConfirmRemoveRecipientTemplate) {

    var ManageRecipientsView = Backbone.View.extend({

        el: $('#modal-wrapper'),
        //el: $('#confirm-remove-recipient-modal'),

        initialize: function (options) {
            this.user = options.user;
            this.recipient = options.recipient;
            this.recipients = options.recipients;
            this.confirmRemoveRecipientTemplate = _.template(ConfirmRemoveRecipientTemplate);
            $('#modal-wrapper').html(this.confirmRemoveRecipientTemplate({ recipient: this.recipient }));
        },

        render: function () {
            this.confirmRemoveRecipientTemplate = _.template(ConfirmRemoveRecipientTemplate);
            this.$el.html(this.confirmRemoveRecipientTemplate({ recipient: this.recipient }));
            this.$el.modal('show');
        },

        unrender: function () {
            this.setElement($('#confirm-remove-recipient-modal'));
            this.remove();
            this.unbind();
        },

        events: {
            "click .remove-recipient-confirm": "removeRecipient"
        },

        removeRecipient: function (event) {
            var that = this;
            this.recipient.destroy({
                success: function (model, response, options) {
                    that.$el.modal('hide');
                    that.recipients.remove(this.recipient);
                    that.unrender();
                },
                error: function (model, xhr, options) {
                    if (xhr && xhr.responseText && xhr.responseText.length > 0) {
                        Util.ShowErrorAlert(xhr.responseText, $('.modal-body'));
                    }
                    else {
                        Util.ShowErrorAlert('Error removing email. Please refresh the page and try again.', $('.modal-body'));
                    }
                }
            });
        }
    });

    return ManageRecipientsView;
});