const express = require('express')
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

module.exports = {users};
