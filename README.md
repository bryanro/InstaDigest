InstaDigest
===========

## Install and Setup Locally

    git clone
    npm install

rename /app/config.js.template to /app/config.js and replace placeholders

rename /app/server/config/instagramusers.json.template to /app/server/config/instagramusers.json and replace placeholders with the users and recipients

    node server

## Install on Server to Push

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

## Forever Setup on Server

    sudo npm install -g forever

start the app with:

    forever \
            start \
            --append \
            -l ~/logs/instadigest/forever.log \
            -o ~/logs/instadigest/out.log \
            -e ~/logs/instadigest/err.log \
            ~/instadigest/server.js

## Hooks on Server

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

## Gmail Issues

If you are a login failure (response code 534) and you've verified your username and password are correct, google may be blocking the request from the new source. To resolve, login to the gmail account and go into the email that says they have blocked the request, then mark that as a known device. Restart the server and it should send emails successfully after that.

Other things that may be required while logged into the gmail account:

1. [https://www.google.com/settings/security/lesssecureapps](https://www.google.com/settings/security/lesssecureapps)
2. [http://www.google.com/accounts/DisplayUnlockCaptcha](http://www.google.com/accounts/DisplayUnlockCaptcha)