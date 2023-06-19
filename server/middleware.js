const jwt = require('jsonwebtoken');
const {jwtSecret, userTable, cookieName, adminPermissionLevel} = require('./config');
const {selectQuery, updateQuery, upsertQuery} = require('./dbUtils');

const validJWTNeeded = (req, res, next) => {
  if (req.headers['authorization']) {
    try {
      let authorization = req.headers['authorization'].split(' ');
      if (authorization[0] !== 'Bearer') {
        return res.status(401).send({error: 'incorrect login header'});
      } else {
        req.jwt = jwt.verify(authorization[1], jwtSecret);
        return next();
      }
    } catch (err) {
      return res.status(403).send({error: 'not logged in ' + err});
    }
  } else {
    return res.status(401).send({error: 'improper login header'});
  }
};

const validCookieNeeded = (req, res, next) => {
  try {
    const cookie = req.cookies[cookieName];
    if (!cookie) {
      return res.status(401).send({error: 'Not logged in'});
    } else {
      req.jwt = jwt.verify(cookie, jwtSecret);
      return next();
    }
  } catch (err) {
    return res.status(403).send({error: 'not logged in'});
  }
};


const minimumPermissionLevelNeeded = (requiredPermissionLevel) => {
  return (req, res, next) => {
    if (requiredPermissionLevel == 0) return next();

    const {username} = req.jwt;
    selectQuery(userTable, ['username', 'permissionlevel'], {username})
      .then(result => {
        if (result.rows.length == 1) {
          const userPermissionLevel = result.rows[0].permissionlevel;
          if (userPermissionLevel >= requiredPermissionLevel) {
            return next();
          } else {
            return res.status(403).send({error: 'you don\'t have this permission'});
          }
        } else {
          res.status(400).send({error: 'No user with this username'});
        }
      });
  };
};


const thisUserOrAdminNeeded = (req, res, next) => {
  if (req.headers['authorization']) {
    try {
      let authorization = req.headers['authorization'].split(' ');
      if (authorization[0] !== 'Bearer') {
        return res.status(401).send({error: 'incorrect login header'});
      } else {
        jwt.verify(authorization[1], jwtSecret, (err, payload) => {
            const username = payload.username;
            if (req.body.username != username) {
              selectQuery(userTable, ['username', 'permissionlevel'], {username})
                .then(result => {
                  if (result.rows.length == 1) {
                    const userPermissionLevel = result.rows[0].permissionlevel;
                    if (userPermissionLevel >= adminPermissionLevel) {
                      next();
                    } else {
                      return res.status(403).send({error: 'must be this user or admin'});
                    }
                  }
                });
            } else {
              next(); // you are this user so we're good
            }
          });
      }
    } catch (err) {
      return res.status(403).send({error: 'not logged in ' + err});
    }
  } else {
    return res.status(401).send({error: 'improper login header'});
  }
}


module.exports = {
  validJWTNeeded,
  validCookieNeeded,
  minimumPermissionLevelNeeded,
  thisUserOrAdminNeeded,
};

