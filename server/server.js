
const express = require('express');
const {
  login, createUser,
  updateUser, deleteUser, listUsers,
  loginRequired,
  userLoginRequired,
  permissionRequired,
  userLoginOrPermissionRequired,
} = require('./middleware');
const {
  adminPermissionLevel,
} = require('./config');
const urlParser = require('url');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const port = process.env.PORT || 8000;

process.on('uncaughtException', function (err) {
      console.log(err);
});

// -------------------------------------------------------------------------
// User Routes
// -------------------------------------------------------------------------
const users = express();
users.use(express.json());
users.use(express.urlencoded({ extended: false }));

users.post('/create', [
  createUser,
]);

users.post('/login', [
  login,
]);

users.get('/is_authed', [
  loginRequired,
  (req, res) => res.status(200).send(true),
]);

users.get('/is_authed_as_user', [
  userLoginRequired,
  (req, res) => res.status(200).send(true),
]);

users.post('/update', [
  loginRequired,
  userLoginOrPermissionRequired(adminPermissionLevel),
  updateUser,
]);

users.post('/delete', [
  loginRequired,
  userLoginOrPermissionRequired(adminPermissionLevel),
  deleteUser,
]);

users.get('/list_users', [
  loginRequired,
  permissionRequired(adminPermissionLevel),
  listUsers,
]);


// -------------------------------------------------------------------------
// Dashboard
// -------------------------------------------------------------------------
const dashboard = express();
console.log(__dirname);

// dashboard.get('/dashboard

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

