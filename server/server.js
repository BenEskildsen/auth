
const express = require('express');
const {
  writeQuery, selectQuery, updateQuery,
  deleteQuery,
} = require('./dbUtils');
const {
  validJWTNeeded, validCookieNeeded,
  minimumPermissionLevelRequired,
  recordVisit,
} = require('./middleware');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {jwtSecret, AUTH_TYPE, cookieName, userTable} = require('./config');
const urlParser = require('url');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const port = process.env.PORT || 8000;

const useAuth = AUTH_TYPE == 'COOKIE' ? validCookieNeeded : validJWTNeeded;

process.on('uncaughtException', function (err) {
      console.log(err);
});

// -------------------------------------------------------------------------
// Users
// -------------------------------------------------------------------------
const users = express();
users.use(express.json());
users.use(express.urlencoded({ extended: false }));

users.post('/create', (req, res) => {
  const salt = crypto.randomBytes(16).toString('base64');
  const hash = crypto.createHmac('sha512',salt)
    .update(req.body.password).digest("base64");
  req.body.password = salt + "$" + hash;
  const {username, password, email} = req.body;

  writeQuery(userTable, {username, password, email, permissionLevel: 1})
    .then(() => {
      const tokens = getTokens(req);
      if (AUTH_TYPE == 'COOKIE') {
        res.cookie(cookieName, tokens.accessToken);
      }
      res.status(201).send(tokens);
    })
    .catch((err) => {
      res.status(500).send({error: 'failed to create user (probably duplicate username)'});
    });
});

users.post('/login', (req, res) => {
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
          res.status(201).send(tokens);
        } else {
          res.status(400).send({error: 'Incorrect password'});
        }
        return res;
      } else {
        res.status(400).send({error: 'No user with this username'});
      }
    })
    .catch((err) => {
      res.status(500).send({error: 'Unknown login error :('});
    });
});

users.post('/update', [
  useAuth,
  (req, res) => {
    // TODO: check that you are logged in as the user you want to change
    // TODO: do the update query
    res.status(404).send({error: 'Not yet implemented'});
  }
]);

users.get('/is_authed', [
  useAuth,
  (req, res) => {
    res.status(200).send(true);
  },
]);

users.get('/list_users', [
  useAuth,
  minimumPermissionLevelRequired(7),
  (req, res) => {
    selectQuery(userTable, ['username', 'email', 'numlogins', 'lastlogin', 'permissionlevel'], {})
      .then((result) => {
        res.status(201).send(result.rows);
      });
  },
]);

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

// use like:
// comments.post('/comment', [
//   useAuth,
//   minimumPermissionLevelRequired(0),
//   postComment,
// ]);

// -------------------------------------------------------------------------
// Blog
// -------------------------------------------------------------------------
const auth = express();

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

auth.use(recordVisit);
auth.use(express.static(path.join(__dirname, '../www')));
auth.use(express.json());
auth.use(cors());
auth.use(cookieParser());
auth.use('/auth', users);
console.log("server listening on port", port);

auth.listen(port);

