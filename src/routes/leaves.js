import express from 'express';
import authenticate from './middlewares/authenticate';
import validate from './utils/validate';
import setOverlapFilter from './utils/setOverlapFilter';
import store from '../db';

const router = express.Router();

const excludeId = { projection: { _id: 0 } };

router.use(authenticate);

router.get('/', (req, res) => {
  const filter = {};
  if (req.query.pendingApproval) {
    filter.supervisor = res.locals.user;
    filter.approved = '';
  } else {
    filter.username = res.locals.user;
  }
  store.db.collection('leaves').find(filter, excludeId).sort({ timeFrom: 1 }).toArray((findErr, found) => {
    if (findErr) {
      res.status(500).send(findErr);
      return;
    }
    res.send(found);
  });
});

router.get('/:id', (req, res) => {
  store.db.collection('leaves').findOne({ id: req.params.id }, excludeId, (findErr, found) => {
    if (findErr) {
      res.status(500).send(findErr);
      return;
    }
    if (!found) {
      res.sendStatus(404);
      return;
    }
    if (res.locals.user === found.username || res.locals.user === found.supervisor) {
      res.send(found);
    } else {
      res.sendStatus(403);
    }
  });
});

router.post('/', (req, res) => {
  if (!validate(req)) {
    res.status(400).send('Invalid time.');
    return;
  }
  const newLeave = {
    id: Date.now().toString(),
    username: res.locals.user,
    supervisor: res.locals.foundUser.supervisor,
    type: req.body.type,
    timeFrom: new Date(req.body.timeFrom),
    timeTo: new Date(req.body.timeTo),
    approved: '',
  };
  const filter = setOverlapFilter(res.locals.user, newLeave);
  store.db.collection('leaves').findOne(filter, (findErr, found) => {
    if (findErr) {
      res.status(500).send(findErr);
      return;
    }
    if (!found) {
      store.db.collection('leaves').insertOne(newLeave, () => {
        res.send(newLeave);
      });
    } else {
      res.status(409).send('Leave conflict.');
    }
  });
});

router.put('/:id', (req, res) => {
  const update = { $set: {} };
  const oldLeave = { body: {} };
  if (!(req.body.approved === undefined)) {
    store.db.collection('leaves').findOne({ id: req.params.id }, excludeId, (findErr, found) => {
      if (findErr) {
        res.status(500).send(findErr);
        return;
      }
      if (!found) {
        res.sendStatus(404);
        return;
      }
      if (found.supervisor !== res.locals.user) {
        res.sendStatus(403);
        return;
      }
      store.db.collection('leaves').updateOne({ id: req.params.id }, { $set: { approved: req.body.approved } }, (updateErr) => {
        if (updateErr) {
          res.status(500).send(updateErr);
          return;
        }
        res.send('Approve status updated.');
      });
    });
  } else {
    if (!req.body.type && !req.body.timeFrom && !req.body.timeTo) {
      res.sendStatus(400);
      return;
    }
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);
    store.db.collection('leaves').findOne({ id: req.params.id }, excludeId, (findErr, found) => {
      if (findErr) {
        res.status(500).send(findErr);
        return;
      }
      if (!found) {
        res.sendStatus(404);
        return;
      }
      if (found.username !== res.locals.user) {
        res.sendStatus(403);
        return;
      }
      if (found.timeFrom < deadline) {
        res.sendStatus(403);
        return;
      }
      oldLeave.body = found;
      if (req.body.type) {
        oldLeave.body.type = req.body.type;
        update.$set.type = req.body.type;
      }
      if (req.body.timeFrom) {
        oldLeave.body.timeFrom = req.body.timeFrom;
        update.$set.timeFrom = new Date(req.body.timeFrom);
      }
      if (req.body.timeTo) {
        oldLeave.body.timeTo = req.body.timeTo;
        update.$set.timeTo = new Date(req.body.timeTo);
      }
      oldLeave.body.approved = '';
      update.$set.approved = '';
      if (!validate(oldLeave)) {
        res.sendStatus(400);
        return;
      }
      oldLeave.body.timeFrom = new Date(req.body.timeFrom);
      oldLeave.body.timeTo = new Date(req.body.timeTo);
      const filter = setOverlapFilter(res.locals.user, oldLeave.body, req.params.id);
      store.db.collection('leaves').findOne(filter, (findOverlapErr, foundOverlap) => {
        if (findOverlapErr) {
          res.status(500).send(findOverlapErr);
          return;
        }
        if (!foundOverlap) {
          store.db.collection('leaves').updateOne({ id: req.params.id }, update, {}, (updateErr) => {
            if (updateErr) {
              res.status(500).send(findErr);
              return;
            }
            res.send('Leave data updated.');
          });
        } else {
          res.sendStatus(409);
        }
      });
    });
  }
});

router.delete('/:id', (req, res) => {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7);
  store.db.collection('leaves').findOne({ id: req.params.id }, excludeId, (findErr, found) => {
    if (findErr) {
      res.status(500).send(findErr);
      return;
    }
    if (!found) {
      res.sendStatus(404);
      return;
    }
    if (found.username !== res.locals.user) {
      res.sendStatus(403);
      return;
    }
    if (found.timeFrom < deadline) {
      res.sendStatus(403);
      return;
    }
    store.db.collection('leaves').deleteOne({ id: req.params.id }, (deleteErr) => {
      if (deleteErr) {
        res.status(500).send(deleteErr);
        return;
      }
      res.send('Leave deleted.');
    });
  });
});

router.patch('/:id', (req, res) => {
  const now = new Date();
  store.db.collection('leaves').findOne({ id: req.params.id }, excludeId, (findErr, found) => {
    if (findErr) {
      res.status(500).send(findErr);
      return;
    }
    if (!found) {
      res.sendStatus(404);
      return;
    }
    if (found.username !== res.locals.user) {
      res.sendStatus(403);
      return;
    }
    if (found.timeFrom < now && found.timeTo > now) {
      store.db.collection('leaves').updateOne({ id: req.params.id }, { $set: { timeTo: now } }, {}, (updateErr) => {
        if (updateErr) {
          res.status(500).send(findErr);
          return;
        }
        res.status(200).send('Leave canceled.');
      });
    } else {
      res.sendStatus(403);
    }
  });
});

export default router;
