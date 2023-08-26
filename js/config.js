const isLocalHost = true;
module.exports = {
  isLocalHost,
  AUTH_TYPE: 'COOKIE', // || 'JWT'
  // TODO: probably not necessary since I can (and am, see auth.js) just use location.origin
  authURL: isLocalHost ? 'http://localhost:8000' : 'your URL here',
  cookieName: 'benAuthCookie',
};
