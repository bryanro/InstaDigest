module.exports = {
    development: {
        mongoConn: 'mongodb://localhost/instadigest',
        verbosityLevel: 'debug',
        sessionExpiration: 86400000 * 30    // 30 days
    },
    beta: {
        mongoConn: process.env.OPENSHIFT_MONGODB_DB_URL + 'instadigest',
        verbosityLevel: 'debug',
        sessionExpiration: 86400000 * 10    // 10 days
    },
    production: {
        mongoConn: process.env.OPENSHIFT_MONGODB_DB_URL + 'instadigest',
        verbosityLevel: 'warn',
        sessionExpiration: 86400000 * 10    // 10 days
    }
}

/*

HOW TO SET ENVIRONMENT IN OPENSHIFT:

1. SSH in
2. Open ~/nodejs-0.6/conf/node.env
3. Add line: export NODE_ENV=[development|beta|production]

*/