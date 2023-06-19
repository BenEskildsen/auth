module.exports = {
  isLocalHost: true,
  ...require('../.secrets.js'),
  AUTH_TYPE: 'JWT', // || 'COOKIE'
  cookieName: 'benAuthCookie',
  userTable: 'users',
};
