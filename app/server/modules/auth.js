var logger = require('./logger');
var urlparser = require('url');
var app = module.parent.exports.app;
var instagram = require('../controllers/instagram');

var noAuthNeededPages = [
    "/test",
    "/index",
    "/index.html",
    "/favicon.ico",
    "/email"
];

module.exports = function (req, res, next) {
    url = req.urlp = urlparser.parse(req.url, true);

    logger.debug('url.pathname = ' + url.pathname, 'auth.js', username);

    // if requesting Access Control for CORS, continue
    if (req.get('Access-Control-Request-Method') !== undefined) {
        logger.debug('Access-Control-Request-Method !== undefined', 'auth.js', username);
        next();
        return;
    }

    // don't require username/pw for javascript and css
    if (url.pathname.substring(0, 3) === '/js' || url.pathname.substring(0, 4) === '/css' || url.pathname.substring(0, 5) === '/auth' || url.pathname.substring(0, 10) === '/templates') {
        logger.debug('Auth not necessary for js, css, or templates: ' + url.pathname, 'auth.js', username);
        next();
        return;
    }

    // don't require username/pw for these pages
    if (noAuthNeededPages.indexOf(url.pathname) > -1) {
        logger.debug('Auth not necessary for this path: ' + url.pathname, 'auth.js', username);
        next();
        return;
    }

    // don't require username/pw for creating new user account via POST /user
    /*if (url.pathname === '/user' && req.method.toUpperCase() === 'POST') {
        logger.debug('Auth not necessary for creating new user via POST /user', 'auth.js');
        next();
        return;
    }*/

    // Is user already authenticated with a valid session
    if (req.session && req.session.auth) {
        logger.debug('User is already authenticated', 'auth.js', req.session.user.instagramUsername);
        next();
        return;
    }

    // User has not been authenticated
    req.session.unauthUrl = url.pathname; // save for redirect later in instagram.js authRedirect function
    logger.warn('User is not authenticated for: ' + req.session.unauthUrl);
    instagram.authenticate(req, res);
    return;

    /*if (username !== undefined && remembermekey !== undefined) {
        logger.debug('Validating cookie', 'auth.js');
        Cookies.validateCookies(username, remembermekey, function (err, newCookie) {
            if (err) {
                if (url.pathname == "/" || url.pathname == "/index.html") {
                    //res.render('login.jade', { "pageTitle": "Login" });
                    logger.warn('Validate cookies failed for path / or path /index.html so redirect to login', 'auth.js', username);
                    res.redirect('/login');
                }
                else {
                    logger.warn('Validate cookies failed, so return unauthorized access', 'auth.js', username);
                    res.send(401, 'Unauthorized Access');
                }
                return;
            }
            else {
                logger.debug('Successfully validated cookie, saving new cookie to browser: ' + newCookie, 'auth.js');
                // save new cookie to browser
                res.cookie('remembermekey', newCookie, { maxAge: app.config.cookieExpiration });
                req.session.auth = true;
                next();
                return;
            }
        });
    }
    else {
        logger.debug('username and/or remembermekey are undefined', 'auth.js', username);
        if (url.pathname == "/" || url.pathname == "/index.html") {
            logger.warn('User is not validated, so go to login');
            res.redirect('/login');
        }
        else {
            logger.error('Not authorized to get to this url: ' + url.pathname, 'auth.js', username);
            res.send(401, 'Unauthorized Access');
        }
        return;
    }*/
}

logger.info('auth.js loaded', 'auth.js');