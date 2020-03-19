import express from 'express';
import authenticate from './middlewares/authenticate';
import store from '../db';

const router = express.Router();
const excludeIdAndPassword = { projection: { _id: 0, password: 0 } };

router.use(authenticate);

router.get('/', (req, res) => {
  const filter = {};
  if (res.locals.user !== 'root') {
    filter.$or = [{ username: res.locals.user },
      { supervisor: res.locals.user }];
  }
  store.db.collection('users').find(filter, excludeIdAndPassword).sort({ timeFrom: 1 }).toArray((findErr, found) => {
    if (findErr) {
      res.status(500).send(findErr);
      return;
    }
    res.send(found);
  });
});

router.post('/', (req, res) => {
  if (res.locals.user === 'root') {
    if (req.body.username === 'root') {
      res.status(403).send('Superuser cannot be modified.');
      return;
    }
    if (req.body.username === req.body.supervisor) {
      res.status(403).send('Users cannot be their own supervisor.');
      return;
    }
    const newuser = {
      username: req.body.username,
      password: req.body.password,
      supervisor: req.body.supervisor,
    };
    store.db.collection('users').findOne({ username: req.body.supervisor }, (checkErr, supervisorFound) => {
      if (checkErr) {
        res.status(500).send(checkErr);
        return;
      }
      if (!supervisorFound) {
        res.status(403).send('Supervisor not exist.');
      } else {
        store.db.collection('users').findOne({ username: req.body.username }, (findErr, found) => {
          if (findErr) {
            res.status(500).send(findErr);
            return;
          }
          if (!found) {
            store.db.collection('users').insertOne(newuser, (addErr) => {
              if (addErr) {
                res.status(500).send(addErr);
                return;
              }
              res.status(200).send('New user created.');
            });
          } else {
            store.db.collection('users').replaceOne({ username: req.body.username }, newuser, (updateErr) => {
              if (updateErr) {
                res.status(500).send(updateErr);
                return;
              }
              res.status(200).send('User information updated.');
            });
          }
        });
      }
    });
  } else {
    res.sendStatus(403);
  }
});

router.delete('/:username', (req, res) => {
  if (res.locals.user === 'root') {
    if (req.params.username === 'root') {
      res.status(403).send('Superuser cannot be deleted.');
      return;
    }
    store.db.collection('users').findOne({ supervisor: req.params.username }, (findErr, isSupervisor) => {
      if (findErr) {
        res.status(500).send(findErr);
        return;
      }
      if (!isSupervisor) {
        store.db.collection('users').deleteOne({ username: req.params.username }, (deleteErr, result) => {
          if (deleteErr) {
            res.status(500).send(deleteErr);
            return;
          }
          if (result.deletedCount === 0) {
            res.sendStatus(404);
          } else {
            res.status(200).send('User deleted.');
          }
        });
      } else {
        res.status(403).send('This user is a supervisor.');
      }
    });
  } else {
    res.sendStatus(403);
  }
});

export default router;
