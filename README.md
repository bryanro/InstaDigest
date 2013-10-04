InstaDigest
===========


## Installing bcrypt on Windows Machine

If Visual Studio 2012 is installed, try running: npm install bcrypt --msvs_version=2012

Otherwise try installing the following:
1. Windows 7.1 SDK: http://www.microsoft.com/en-us/download/details.aspx?id=8279
2. Visual Studio C++ 2010 Express: http://go.microsoft.com/?linkid=9709949
3. Compiler Update for 64-bit: http://www.microsoft.com/en-us/download/details.aspx?id=4422

## Libraries

## Database Setup

If running on openshift, add admin user to instadigest dbs:
1. db.system.users.find()
2. use instadigest
3. db.system.users.save({ ... });	(insert values from #1)

Config values to setup with db.configs.save({ key: 'key', value: 'value' }):
- emailAccount: the account to send from using SMTP
- emailPassword: the emailAccount password for SMTP
- cronDateTime: the schedule to send the daily digest of emails
- instagramClientId: client ID for instagram API
- instagramClientId: client secret for instagram API
- instagramRedirectUri: redirect URI for instagram API
- testEmailAddress: email to send to for running the tests