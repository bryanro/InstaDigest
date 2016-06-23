InstaDigest
===========

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [About](#about)
- [Setup and Server Configuration](#setup-and-server-configuration)
  - [Install and Setup Locally](#install-and-setup-locally)
  - [Install on Server to Push](#install-on-server-to-push)
  - [Forever Setup on Server](#forever-setup-on-server)
  - [Hooks on Server](#hooks-on-server)
  - [Configurations](#configurations)
  - [Gmail Issues](#gmail-issues)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## About

InstaDigest is an server-side application that sends out a daily digest email (and weekly "historical" digest email) with pictures from one or more instagram users to one or more recipients.

## Setup and Server Configuration

### Install and Setup Locally

    git clone
    npm install

rename /app/config.js.template to /app/config.js and replace placeholders

rename /app/server/config/instagramusers.json.template to /app/server/config/instagramusers.json and replace placeholders with the users and recipients

    node server

### Install on Server to Push

    mkdir instadigest.git
    cd instadigest.git
    git init --bare
    cd ..
    git clone instadigest.git
    mkdir logs
    cd logs
    mkdir instadigest

add remote to local git and push to server

    cd ~/instadigest
    git pull

rename /app/config.js.template to /app/config.js and replace placeholders

rename /app/server/config/instagramusers.json.template to /app/server/config/instagramusers.json and replace placeholders with the users and recipients

    node server

### Forever Setup on Server

    sudo npm install -g forever

start the app with:

    forever \
            start \
            --append \
            -l ~/logs/instadigest/forever.log \
            -o ~/logs/instadigest/out.log \
            -e ~/logs/instadigest/err.log \
            ~/instadigest/server.js

### Hooks on Server

    cd ~/instadigest/hooks
    touch post-receive
    chmod +x post-receive

paste the following to the post-receive file and save it:

    #!/bin/bash
    echo POST-RECEIVE HOOK INITIALIZED
    
    # change directory
    cd ~/instadigest
    
    # unset the git directory so git pull will work
    unset GIT_DIR

    # pull latest from bare
    git pull
    
    # stop forever
    forever stop ~/instadigest/server.js
    
    # start forever
    forever \
            start \
            --append \
            -l ~/logs/instadigest/forever.log \
            -o ~/logs/instadigest/out.log \
            -e ~/logs/instadigest/err.log \
            --sourceDir ~/instadigest \
            server.js

### Configurations

The following configuration files need to be setup after the application is pushed to the server by renaming the *.template files:

- app/config.js
- app/server/config/instagramusers.json
- app/server/config/recipients.json

### Gmail Issues

If you are a login failure (response code 534) and you've verified your username and password are correct, google may be blocking the request from the new source. To resolve, login to the gmail account and go into the email that says they have blocked the request, then mark that as a known device. Restart the server and it should send emails successfully after that.

Other things that may be required while logged into the gmail account:

1. [https://www.google.com/settings/security/lesssecureapps](https://www.google.com/settings/security/lesssecureapps)
2. [http://www.google.com/accounts/DisplayUnlockCaptcha](http://www.google.com/accounts/DisplayUnlockCaptcha)

## Tests and Code Coverage

### Prerequisites

Install mocha and instanbul 

    npm install -g mocha
    npm install -g istanbul

### Executing the Tests

From the instadigest root, execute the following in the terminal:

    mocha
    
You should see output similar to the following:

    $ mocha
    
      Models
        Users Model
          positive tests
            ✓ should return all instagram users from getUsers
            ✓ should return the instagram user searched for using getUser
          negative tests
    WARNING: Replacing existing mock for module: ../config/instagramusers.json
            ✓ should return an empty array from getUsers when there are no users
            ✓ should return undefined for a user that does not exist from getUser
        Recipients Model
          positive tests
            ✓ should return all recipients from getRecipients
            ✓ should return all daily digest recipients from getDailyDigestRecipients
            ✓ should return all weekly digest recipients from getWeeklyDigestRecipients
            ✓ should return the recipient searched for using getRecipient
          negative tests
    WARNING: Replacing existing mock for module: ../config/recipients.json
            ✓ should return an empty array from getRecipients with no recipients
            ✓ should return an empty array from getDailyDigestRecipients with no recipients
            ✓ should return an empty array from getWeeklyDigestRecipients with no recipients
            ✓ should return an undefined object when searching for a user that does not exist using getRecipient
            
      12 passing (87ms)

### Code Coverage

Code Coverage can be run either by executing the codecoverage.sh bash script, or by executing the following lines in terminal from the instadigest root:

    istanbul cover _mocha -- -R spec
    open coverage/lcov-report/index.html

## Instagram Access Token

### Instagram Developer Setup

1. Create a new Client
2. Add `http://localhost` to the valid URI redirects list
3. Make sure `Disable implicit OAuth` is unchecked

### User

1. Login to Instagram as the user
2. Navigate to `https://instagram.com/oauth/authorize/?client_id=[CLIENT_ID_HERE]&redirect_uri=http://localhost&response_type=token`, replacing the `[CLIENT_ID_HERE]`
3. Get the access token from the url
