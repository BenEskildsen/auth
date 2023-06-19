const jwt = require('jsonwebtoken');
const {jwtSecret, userTable, cookieName} = require('./config');
const {selectQuery, updateQuery, upsertQuery} = require('./dbUtils');

const validJWTNeeded = (req, res, next) => {
  if (req.headers['authorization']) {
    try {
      let authorization = req.headers['authorization'].split(' ');
      if (authorization[0] !== 'Bearer') {
        return res.status(401).send({error: 'improper login header'});
      } else {
        req.jwt = jwt.verify(authorization[1], jwtSecret);
        return next();
      }
    } catch (err) {
      return res.status(403).send({error: 'not logged in'});
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


const minimumPermissionLevelRequired = (requiredPermissionLevel) => {
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

const recordVisit = (req, res, next) => {
  // const {hostname, path, map, isUnique} = req.body;
  // const table = 'site_visits';
  // if (!isUnique) {
  //   upsertQuery(
  //     table,
  //     {
  //       hostname, path, map,
  //       num_visits: 1,
  //       num_unique_visits: 0,
  //       last_visited: new Date(),
  //     },
  //     {
  //       num_visits: table + '.num_visits + 1',
  //       last_visited: 'current_timestamp',
  //     },
  //     {hostname, path, map},
  //   ).then(() => {
  //     res.status(201).send({success: true});
  //   });
  // } else {
  //   upsertQuery(
  //     table,
  //     {
  //       hostname, path, map,
  //       num_visits: 1,
  //       num_unique_visits: 1,
  //       last_visited: new Date(),
  //     },
  //     {
  //       num_visits: table + '.num_visits + 1',
  //       num_unique_visits: table + '.num_unique_visits + 1',
  //       last_visited: 'current_timestamp',
  //     },
  //     {hostname, path, map},
  //   ).then(() => {
  //     res.status(201).send({success: true});
  //   });
  // }
  next();
};



module.exports = {
  validJWTNeeded,
  validCookieNeeded,
  minimumPermissionLevelRequired,
  recordVisit,
};

