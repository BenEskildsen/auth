

module.exports = {
  userTable: 'users',
  adminPermissionLevel: 7,

  ...require('../js/config.js'), // have to do this to isolate which
                                 // config params make it to client (ie no secrets!)
  ...require('../.secrets.js'),
};
