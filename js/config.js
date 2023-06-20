const isLocalHost = true;
module.exports = {
  isLocalHost,
  AUTH_TYPE: 'COOKIE', // || 'JWT'
  authURL: isLocalHost ? 'http://localhost:8000' : 'your URL here',
  cookieName: 'benAuthCookie',
};
