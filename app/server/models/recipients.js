var mongoose = require('mongoose');
var logger = require('../modules/logger');

var RecipientSchema = new mongoose.Schema({
    name: { type: String, required: false },
    email: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
    lastUpdatedDate: { type: Date, default: Date.now },
    instagramUser: {type: mongoose.Schema.ObjectId, ref: 'Users'}
});

mongoose.model('Recipient', RecipientSchema);

logger.debug('recipients.js model loaded', 'recipients.js');