var instagram = require('./routes/instagram');
var preview = require('./routes/preview');
var scheduler = require('./routes/scheduler');
var test = require('./routes/test');

module.exports = function (app) {
    app.use('/instagram', instagram);
    app.use('/preview', preview);
    app.use('/scheduler', scheduler);
    app.use('/test', test);
};
