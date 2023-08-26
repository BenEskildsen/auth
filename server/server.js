
const express = require('express');
const {
  loginRequired,
  permissionRequired,
} = require('./middleware');
const {
  adminPermissionLevel,
} = require('./config');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const {users} = require('./users');

const port = process.env.PORT || 8000;

process.on('uncaughtException', function (err) {
  console.log(err);
});


// -------------------------------------------------------------------------
// App
// -------------------------------------------------------------------------
const auth = express();
auth.use(cookieParser());
auth.use(express.json());
auth.use(cors());

// NOTE: only login-required paths need to be specified, everything else
// gets handled by /
// NOTE: must go first since preventing fallthrough like this means it checks this
// authentication before doing anything else
// NOTE: fallthrough: false for static routes means that if you match the given
// route, but your file doesn't exist, then it will stop looking and just 404.
// Otherwise, it would keep checking other routes
auth.use('/dashboard', [
  loginRequired,
  permissionRequired(adminPermissionLevel),
  express.static(path.join(__dirname, '../www/dashboard'), {fallthrough: false}),
]);

auth.use('/auth', users);
auth.use('/',
  express.static(path.join(__dirname, '../www'), {fallthrough: false}),
);


if (port != 80) {
  // force https redirect, and don't try to record site visits in prod
  // blog.use((req, res, next) => {
  //   if (req.header('x-forwarded-proto') !== 'https') {
  //     res.redirect(`https://${req.header('host')}${req.url}`)
  //   } else {
  //     next()
  //   }
  // })
}

console.log("server listening on port", port);

auth.listen(port);

