#!/bin/bash

# babel transform
mkdir temp_bin
npm run babel -- js/ -d temp_bin

# clientside require everything into a single bundle.js file
mkdir www/bin
npm run browserify -- temp_bin/pages/index.js -o www/bin/bundle.js -p esmify
mkdir www/login/bin
npm run browserify -- temp_bin/pages/login.js -o www/login/bin/bundle.js -p esmify
mkdir www/dashboard/bin
npm run browserify -- temp_bin/pages/dashboard.js -o www/dashboard/bin/bundle.js -p esmify



# clean up babelified content
rm -rf temp_bin
