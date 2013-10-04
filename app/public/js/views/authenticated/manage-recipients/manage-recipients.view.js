define([
  'jquery',
  'underscore',
  'backbone',
  'util/util',
  'models/recipient.model',
  './modals/confirm-remove-recipient.view',
  'text!./manage-recipients.html',
], function ($, _, Backbone, Util, RecipientModel, ConfirmRemoveRecipientView, ManageRecipientsTemplate) {

    var ManageRecipientsView = Backbone.View.extend({

        el: $('.manage-recipients-container'),

        initialize: function (options) {
            this.user = options.user;
            this.recipients = options.recipients;

            var that = this;
            this.recipients.on('remove', function (model) {
                that.render();
            });
        },

        render: function () {
            // if $elwasn't found in the DOM on initialize, reset it
            if (this.$el.length < 1) {
                this.setElement($('.manage-recipients-container'));
            }
            this.manageRecipientsTemplate = _.template(ManageRecipientsTemplate);
            this.$el.html(this.manageRecipientsTemplate({ recipients: this.recipients }));
        },

        events: {
            "click .add-recipient-submit": "addRecipient",
            "keypress #add-recipient-email": "addRecipientKeypress",
            "click .remove-recipient": "confirmRemoveRecipient"
        },

        addRecipient: function (event) {
            var that = this;
            var recipientEmail = $('#add-recipient-email').val();

            if (recipientEmail.length <= 0 || recipientEmail.indexOf('@') <= 0) {
                Util.ShowErrorAlert('Enter valid email address.', $('.add-recipient-form'));
            }
            else {
                var newRecipient = new RecipientModel({
                    email: recipientEmail
                });
                newRecipient.save({}, {
                    success: function (model, response, options) {
                        $('#add-recipient-email').val('');
                        that.recipients.push(model);
                        that.render();
                    },
                    error: function (model, xhr, options) {
                        if (xhr && xhr.responseText && xhr.responseText.length > 0) {
                            Util.ShowErrorAlert(xhr.responseText, $('.add-recipient-form'));
                        }
                        else {
                            Util.ShowErrorAlert('Error adding email. Please refresh the page and try again.', $('.add-recipient-form'));
                        }
                    }
                });
            }
        },

        addRecipientKeypress: function (event) {
            // if ENTER is pressed
            if (event.which === 13) {
                event.preventDefault();
                this.addRecipient();
            }
        },

        confirmRemoveRecipient: function (event) {
            var $removeButton = $(event.target);
            var recipientId = Util.GetIdFromElement($removeButton.parents('.recipient-list-item').attr('id'));
            var selectedRecipient = this.recipients.get(recipientId);

            this.confirmRemoveRecipientView = new ConfirmRemoveRecipientView({ user: this.user, recipient: selectedRecipient, recipients: this.recipients});
            this.confirmRemoveRecipientView.render();
        }
    });

    return ManageRecipientsView;
});