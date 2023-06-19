
const isLocalHost = true;

module.exports = {
  isLocalHost,

  AUTH_TYPE: 'JWT', // || 'COOKIE'
  authURL: isLocalHost ? 'http://localhost:8000' : 'your URL here',
  cookieName: 'benAuthCookie',

  userTable: 'users',
  adminPermissionLevel: 7,

  ...require('../.secrets.js'),
};
