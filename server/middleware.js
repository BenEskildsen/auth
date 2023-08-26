const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {
  writeQuery, selectQuery, updateQuery,
  deleteQuery, upsertQuery,
} = require('./dbUtils');
const {
  jwtSecret, userTable, cookieName, adminPermissionLevel,
  AUTH_TYPE,
} = require('./config');


// -------------------------------------------------------------------------
// Login and Create Users
// -------------------------------------------------------------------------

const createUser = (req, res) => {
  const salt = crypto.randomBytes(16).toString('base64');
  const hash = crypto.createHmac('sha512',salt)
    .update(req.body.password).digest("base64");
  req.body.password = salt + "$" + hash;
  const {username, password, email} = req.body;

  writeQuery(userTable, {username, password, email: email ?? null, permissionLevel: 1})
    .then(() => {
      const tokens = getTokens(req);
      // automatically login created user
      // if (AUTH_TYPE == 'COOKIE') {
      //   res.cookie(cookieName, tokens.accessToken);
      // }
      res.status(201).send(tokens);
    })
    .catch((err) => {
      res.status(500).send({error: 'failed to create user (probably duplicate username)'});
    });
};


const login = (req, res) => {
  const {username} = req.body;

  selectQuery(userTable, ['username', 'password'], {username})
    .then(result => {
      if (result.rows.length == 1) {
        const user = result.rows[0];
        const passwordFields = user.password.split('$');
        const salt = passwordFields[0];
        const hash = crypto.createHmac('sha512', salt)
          .update(req.body.password).digest("base64");
        if (hash == passwordFields[1]) {
          updateQuery('users',
            {numlogins: 'numlogins + 1', lastlogin: 'current_timestamp'},
            {username},
          );
          const tokens = getTokens(req);
          if (AUTH_TYPE == 'COOKIE') {
            res.cookie(cookieName, tokens.accessToken);
          }
          res.status(200).send(tokens);
        } else {
          res.status(400).send({error: 'Incorrect password'});
        }
        return res;
      } else {
        res.status(400).send({error: 'No user with this username'});
      }
    })
    .catch((err) => {
      res.status(500).send({error: 'Error: ' + err});
    });
};


// -------------------------------------------------------------------------
// Update/Delete/List Users
// -------------------------------------------------------------------------

const updateUser = (req, res) => {
  const row = {};
  // TODO: setting password is more complicated
  // if (req.body.password) row.password = password;
  if (req.body.email) row.email = `'${req.body.email}'`; // escape the .com

  updateQuery(userTable, row, {username: req.body.username})
    .then(() => {
      res.status(200).send(true);
    })
    .catch(() => {
      res.status(400).send({error: 'No user with this username'});
    });
}


const deleteUser = (req, res) => {
  deleteQuery(userTable, {username: req.body.username})
    .then(() => {
      res.status(200).send(true);
    })
    .catch(() => {
      res.status(400).send({error: 'No user with this username'});
    });
}


const listUsers = (req, res) => {
  selectQuery(userTable, ['username', 'email', 'numlogins', 'lastlogin', 'permissionlevel'], {})
    .then((result) => {
      res.status(201).send(result.rows);
    });
};


// -------------------------------------------------------------------------
// Validation
// -------------------------------------------------------------------------

const loginRequired = (req, res, next) => {
  try {
    verifyToken(req);
    const {username} = req.jwt;
    getUser(username) // checking for existence of user
      .then((user) => {
        if (user) {
          next();
        } else {
          // res.status(400).send({error: 'No Such User ' + username});
          res.redirect('/login');
        }
      });
  } catch (ex) {
    res.redirect('/login');
    // res.status(403).send({error: 'Not Logged In ' + ex});
  }
}


const userLoginRequired = (req, res, next) => {
  try {
    verifyToken(req);
    const {username} = req.jwt;
    if (req.body.username != username && req.query.username != username) {
      res.status(403).send({error: 'Not Logged In As User ' + username});
    } else {
      getUser(username) // checking for existence of user
        .then((user) => {
          if (user) {
            next();
          } else {
            res.status(400).send({error: 'No Such User ' + username});
          }
        });
    }
  } catch (ex) {
    res.status(403).send({error: 'Not Logged In ' + ex});
  }
}


const permissionRequired = (permissionLevel) => {
  return (req, res, next) => {
    if (permissionLevel == 0) return next();

    const {username} = req.jwt;
    getUser(username).then((user) => {
      if (!user) {
        return res.status(400).send({error: 'No Such User'});
      }
      if (user.permissionlevel >= permissionLevel) {
        return next();
      } else {
        return res.status(403).send({error: 'you don\'t have this permission'});
      }
    });
  }
}


const userLoginOrPermissionRequired = (permissionLevel) => {
  return (req, res, next) => {
    const {username} = req.jwt;
    if (req.body.username == username) {
      next();
    } else {
      getUser(username).then((user) => {
        if (!user) {
          return res.status(400).send({error: 'No Such User'});
        }
        if (user.permissionlevel >= permissionLevel) {
          return next();
        } else {
          return res.status(403).send({error: 'you don\'t have this permission'});
        }
      });
    }
  }
}

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

const verifyToken = (req) => {
  const token = getAuthToken(req);
  req.jwt = jwt.verify(token, jwtSecret);
  return req.jwt;
}


// handles getting the token out of the cookie or out of the header depending on
// which authentication method you are using
const getAuthToken = (req) => {
  if (AUTH_TYPE == 'COOKIE') {
    return req.cookies[cookieName];
  } else {
    let authorization = req.headers['authorization'].split(' ');
    // authorization[0] == 'Bearer'
    return authorization[1];
  }
}


const getUser = (username) => {
  return selectQuery(userTable, ['username', 'permissionlevel', 'numLogins', 'email'], {username})
    .then(result => {
      return result.rows[0];
    });
}


const getTokens = (req) => {
  const refreshId = req.body.username + jwtSecret;
  const salt = crypto.randomBytes(16).toString('base64');
  const hash = crypto.createHmac('sha512', salt)
    .update(refreshId).digest("base64");
  req.body.refreshKey = salt;
  const accessToken = jwt.sign(req.body, jwtSecret);
  const b = new Buffer.from(hash);
  const refreshToken = b.toString('base64');
  return {accessToken, refreshToken};
}


module.exports = {
  login,
  createUser,
  updateUser,
  deleteUser,
  listUsers,
  loginRequired,
  userLoginRequired,
  permissionRequired,
  userLoginOrPermissionRequired,
};

