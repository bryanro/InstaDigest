var instagram = require('./routes/instagram');
var preview = require('./routes/preview');
var scheduler = require('./routes/scheduler');
var status = require('./routes/status');

module.exports = function (app) {
    app.use('/instagram', instagram);
    app.use('/preview', preview);
    app.use('/scheduler', scheduler);
    app.use('/status', status);
};
