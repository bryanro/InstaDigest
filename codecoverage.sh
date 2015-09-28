#!/usr/bin/env bash

# if this fails, ensure that mocha and istanbul are installed globally
#   npm install -g mocha istanbul
# and make sure that this file has execution permissions
#   chmod +x codecoverage.sh

istanbul cover _mocha -- -R spec
open coverage/lcov-report/index.html