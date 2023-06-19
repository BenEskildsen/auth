#!/bin/zsh

# npm run babel -- --plugins transform-react-jsx

mkdir www/bin

npm run babel -- js/ -d www/bin

# clientside require everything into a single bundle.js file
npm run browserify -- www/bin/index.js -o www/bin/bundle.js -p esmify

# remove everything but the bundle
mv www/bin/bundle.js ./
rm -rf www/bin/
mkdir www/bin
# put the bundle back
mv bundle.js www/bin/



