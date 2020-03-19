import store from '../../db';

const authenticate = (req, res, next) => {
  if (!req.headers.authorization) {
    res.sendStatus(401);
    return;
  }
  [res.locals.user, res.locals.pass] = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString().split(':');
  if (!res.locals.user) {
    res.sendStatus(401);
    return;
  }
  store.db.collection('users').findOne({ username: res.locals.user }, (err, foundUser) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    if (!foundUser) {
      res.sendStatus(401);
      return;
    }
    if (foundUser.password !== res.locals.pass) {
      res.sendStatus(401);
      return;
    }
    res.locals.foundUser = foundUser;
    next();
  });
};

export default authenticate;
