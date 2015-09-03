var instagram = require('./routes/instagram');
var scheduler = require('./routes/scheduler');
var test = require('./routes/test');

module.exports = function (app) {
    app.use('/instagram', instagram);
    app.use('/scheduler', scheduler);
    app.use('/test', test);
};
