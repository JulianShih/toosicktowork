import request from 'supertest';
import { assert } from 'chai';
import Core from '../Core';
import store from '../db';
import leavesRouter from './leaves';

const core = new Core();

describe('POST /leaves', () => {
  before((done) => {
    store.setDatabase((err) => {
      core.setRouter('/leaves', leavesRouter);
      done(err);
    });
  });
  it('should respond 200 when attempting to add new leaves if time is local', (done) => {
    request(core.app)
      .post('/leaves')
      .auth('joseph', '2')
      .set('content-type', 'application/json')
      .send('{"type":"official", "timeFrom":"2020-01-02T09:00:00.000+08:00", "timeTo":"2020-01-02T17:00:00.000Z"}')
      .expect(200, () => {
        request(core.app)
          .get('/leaves')
          .auth('joseph', '2')
          .end((err, res) => {
            if (err) {
              done(err);
              return;
            }
            assert.ownInclude(res.body[0], {
              timeFrom: '2020-01-02T01:00:00.000Z',
              timeTo: '2020-01-02T17:00:00.000Z',
            });
            done();
          });
      });
  });
  it('should respond 409 when attempting to add new leaves if range overlapped', (done) => {
    request(core.app)
      .post('/leaves')
      .auth('salieri', 'antonio')
      .set('content-type', 'application/json')
      .send('{"type":"sick", "timeFrom":"2020-01-01T09:00:00.000Z", "timeTo":"2020-01-01T17:00:00.000Z"}')
      .expect(200, () => {
        request(core.app)
          .post('/leaves')
          .auth('salieri', 'antonio')
          .set('content-type', 'application/json')
          .send('{"type":"sick", "timeFrom":"2020-01-01T10:00:00.000Z", "timeTo":"2020-01-01T19:00:00.000Z"}')
          .expect(409, done);
      });
  });
  it('should respond 409 when attempting to add new leaves if range included', (done) => {
    request(core.app)
      .post('/leaves')
      .auth('salieri', 'antonio')
      .set('content-type', 'application/json')
      .send('{"type":"sick", "timeFrom":"2020-01-01T10:00:00.000Z", "timeTo":"2020-01-01T16:00:00.000Z"}')
      .expect(409, done);
  });
  it('should respond 409 when attempting to add new leaves if range includes', (done) => {
    request(core.app)
      .post('/leaves')
      .auth('salieri', 'antonio')
      .set('content-type', 'application/json')
      .send('{"type":"sick", "timeFrom":"2020-01-01T08:00:00.000Z", "timeTo":"2020-01-01T18:00:00.000Z"}')
      .expect(409, done);
  });
  it('should respond 400 when attempting to add new leaves if less than 1 hour', (done) => {
    request(core.app)
      .post('/leaves')
      .auth('salieri', 'antonio')
      .set('content-type', 'application/json')
      .send('{"type":"sick", "timeFrom":"2020-01-01T09:00:00.000Z", "timeTo":"2020-01-01T09:30:00.000Z"}')
      .expect(400, done);
  });
  it('should respond 400 when attempting to add new leaves if time is past', (done) => {
    request(core.app)
      .post('/leaves')
      .auth('joseph', '2')
      .set('content-type', 'application/json')
      .send('{"type":"sick", "timeFrom":"2019-01-01T09:00:00.000Z", "timeTo":"2019-01-01T17:00:00.000Z"}')
      .expect(400, done);
  });
  it('should respond 400 when attempting to add new leaves in one week', (done) => {
    request(core.app)
      .post('/leaves')
      .auth('joseph', '2')
      .set('content-type', 'application/json')
      .send('{"type":"official", "timeFrom":"2019-09-01T09:00:00.000Z", "timeTo":"2019-09-01T17:00:00.000Z"}')
      .expect(400, done);
  });
  it('should respond 400 when attempting to add new leaves if type is invalid', (done) => {
    request(core.app)
      .post('/leaves')
      .auth('joseph', '2')
      .set('content-type', 'application/json')
      .send('{"type":"hairache", "timeFrom":"2020-01-01T09:00:00.000Z", "timeTo":"2020-01-01T17:00:00.000Z"}')
      .expect(400, done);
  });
  it('should respond 400 when attempting to add new leaves if without type', (done) => {
    request(core.app)
      .post('/leaves')
      .auth('joseph', '2')
      .set('content-type', 'application/json')
      .send('{"timeFrom":"2020-01-01T09:00:00.000Z", "timeTo":"2020-01-01T17:00:00.000Z"}')
      .expect(400, done);
  });
  it('should respond 400 when attempting to add new leaves if without time', (done) => {
    request(core.app)
      .post('/leaves')
      .auth('joseph', '2')
      .set('content-type', 'application/json')
      .send('{"type":"official"}')
      .expect(400, done);
  });
  it('should respond 400 when attempting to add new leaves if time format is invalid', (done) => {
    request(core.app)
      .post('/leaves')
      .auth('joseph', '2')
      .set('content-type', 'application/json')
      .send('{"type":"sick", "timeFrom":"時間", "timeTo":"時間"}')
      .expect(400, done);
  });
});

describe('PUT /leaves/:id', () => {
  it('should respond 200 when attempting to reject leaves if is supervisor', (done) => {
    request(core.app)
      .put('/leaves/17501750')
      .auth('zaganos', 'zehir')
      .set('content-type', 'application/json')
      .send('{"approved": "N"}')
      .expect(200, done);
  });
  it('should respond 200 when attempting to approve leaves if is supervisor', (done) => {
    request(core.app)
      .put('/leaves/17501750')
      .auth('zaganos', 'zehir')
      .set('content-type', 'application/json')
      .send('{"approved": "Y"}')
      .expect(200, () => {
        request(core.app)
          .get('/leaves/17501750')
          .auth('beyazid', 'ulema')
          .end((err, res) => {
            if (err) {
              done(err);
              return;
            }
            assert.strictEqual(res.body.approved, 'Y');
            done();
          });
      });
  });
  it('should respond 403 when attempting to approve leaves if not supervisor', (done) => {
    request(core.app)
      .put('/leaves/17501750')
      .auth('beyazid', 'ulema')
      .set('content-type', 'application/json')
      .send('{"approved": "Y"}')
      .expect(403, done);
  });
  it('should respond 200 when attempting to edit own leaves and approved field should become empty', (done) => {
    request(core.app)
      .put('/leaves/17501750')
      .auth('beyazid', 'ulema')
      .set('content-type', 'application/json')
      .send('{"type": "personal", "timeFrom":"2020-02-02T09:00:00.000Z", "timeTo":"2020-02-02T17:00:00.000Z"}')
      .expect(200, () => {
        request(core.app)
          .get('/leaves/17501750')
          .auth('beyazid', 'ulema')
          .end((err, res) => {
            if (err) {
              done(err);
              return;
            }
            assert.ownInclude(res.body, {
              type: 'personal',
              timeFrom: '2020-02-02T09:00:00.000Z',
              timeTo: '2020-02-02T17:00:00.000Z',
              approved: '',
            });
            done();
          });
      });
  });
  it('should respond 403 when attempting to edit leaves of others', (done) => {
    request(core.app)
      .put('/leaves/17501750')
      .auth('zaganos', 'zehir')
      .set('content-type', 'application/json')
      .send('{"timeFrom":"2020-02-02T09:00:00.000Z", "timeTo":"2020-02-02T17:00:00.000Z"}')
      .expect(403, done);
  });
  it('should respond 403 when attempting to edit leaves in one week', (done) => {
    request(core.app)
      .put('/leaves/16501650')
      .auth('zaganos', 'zehir')
      .set('content-type', 'application/json')
      .send('{"timeFrom":"2019-09-20T09:00:00.000Z", "timeTo":"2019-09-20T17:00:00.000Z"}')
      .expect(403, done);
  });
  it('should respond 409 if range of updated leaves overlapped', (done) => {
    request(core.app)
      .put('/leaves/17501750')
      .auth('beyazid', 'ulema')
      .set('content-type', 'application/json')
      .send('{"timeFrom":"2020-02-01T10:00:00.000Z"}')
      .expect(409, done);
  });
  it('should respond 400 when attempting to edit leaves if time format is invalid', (done) => {
    request(core.app)
      .put('/leaves/18501850')
      .auth('beyazid', 'ulema')
      .set('content-type', 'application/json')
      .send('{"timeFrom":"時間", "timeTo":"時間"}')
      .expect(400, done);
  });
  it('should respond 400 when attempting to edit leaves if without request body', (done) => {
    request(core.app)
      .put('/leaves/18501850')
      .auth('beyazid', 'ulema')
      .set('content-type', 'application/json')
      .expect(400, done);
  });
});

describe('GET /leaves', () => {
  it('should respond 404 if leave not found', (done) => {
    request(core.app)
      .get('/leaves/12341234')
      .auth('root', 'root')
      .expect(404, done);
  });
  it('should respond 403 when attempting to get history of others', (done) => {
    request(core.app)
      .get('/leaves/17501750')
      .auth('joseph', '2')
      .expect(403, done);
  });
  it('should not respond _id of found leaves', (done) => {
    request(core.app)
      .get('/leaves')
      .auth('salieri', 'antonio')
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        assert.strictEqual(res.body[0]._id, undefined);
        done();
      });
  });
  it('should respond leaves sorted by timeFrom', (done) => {
    request(core.app)
      .post('/leaves')
      .auth('salieri', 'antonio')
      .set('content-type', 'application/json')
      .send('{"type":"personal", "timeFrom":"2020-01-02T09:00:00.000Z", "timeTo":"2020-01-02T17:00:00.000Z"}')
      .expect(200, () => {
        request(core.app)
          .get('/leaves')
          .auth('salieri', 'antonio')
          .end((err, res) => {
            if (err) {
              done(err);
              return;
            }
            assert.ownInclude(res.body[0], {
              username: 'salieri',
              type: 'sick',
              timeFrom: '2020-01-01T09:00:00.000Z',
              timeTo: '2020-01-01T17:00:00.000Z',
            });
            assert.ownInclude(res.body[1], {
              username: 'salieri',
              type: 'personal',
              timeFrom: '2020-01-02T09:00:00.000Z',
              timeTo: '2020-01-02T17:00:00.000Z',
            });
            done();
          });
      });
  });
  it('should respond leaves of which approved field is empty if is supervisor', (done) => {
    request(core.app)
      .get('/leaves?pendingApproval=true')
      .auth('joseph', '2')
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        assert.ownInclude(res.body[0], {
          supervisor: 'joseph',
          approved: '',
        });
        done();
      });
  });
  it('should not respond leaves of which approved field is true', (done) => {
    request(core.app)
      .put('/leaves/17501750')
      .auth('zaganos', 'zehir')
      .set('content-type', 'application/json')
      .send('{"approved": "Y"}')
      .expect(200, () => {
        request(core.app)
          .get('/leaves?pendingApproval=true')
          .auth('zaganos', 'zehir')
          .end((err, res) => {
            if (err) {
              done(err);
              return;
            }
            assert.strictEqual(res.body[0], undefined);
            done();
          });
      });
  });
});

describe('DELETE /leaves/:id', () => {
  it('should respond 403 when attempting to delete leaves of others', (done) => {
    request(core.app)
      .delete('/leaves/17501750')
      .auth('zaganos', 'zehir')
      .expect(403, done);
  });
  it('should respond 200 when deleted own leaves', (done) => {
    request(core.app)
      .delete('/leaves/17501750')
      .auth('beyazid', 'ulema')
      .expect('Leave deleted.', done);
  });
  it('should respond 403 when attempting to delete leaves after deadline', (done) => {
    request(core.app)
      .delete('/leaves/16501650')
      .auth('zaganos', 'zehir')
      .expect(403, done);
  });
});

describe('PATCH /leaves/:id', () => {
  it('should respond 404 when attempt to cancel not exist leaves', (done) => {
    request(core.app)
      .patch('/leaves/123')
      .auth('joseph', '2')
      .expect(404, done);
  });
  it('should respond 403 when attempt to cancel leaves of others', (done) => {
    request(core.app)
      .patch('/leaves/20502050')
      .auth('joseph', '2')
      .expect(403, done);
  });
  it('should respond 200 when attempt to cancel own leaves', (done) => {
    request(core.app)
      .patch('/leaves/20502050')
      .auth('zaganos', 'zehir')
      .expect('Leave canceled.', done);
  });
  it('should respond 403 when attempt to cancel leave if not during that leave', (done) => {
    request(core.app)
      .patch('/leaves/19501950')
      .auth('zaganos', 'zehir')
      .expect(403, done);
  });
  after(() => {
    store.db.collection('leaves').deleteMany({
      $or: [
        { username: 'salieri' },
        { username: 'joseph' }],
    });
    store.db.collection('leaves').updateOne({ id: '20502050' }, { $set: { timeTo: new Date('2019-10-10T17:00:00.000Z') } }, {});
    store.db.collection('leaves').insertOne({
      id: '17501750',
      username: 'beyazid',
      supervisor: 'zaganos',
      type: 'sick',
      timeFrom: new Date('2020-02-01T09:00:00.000Z'),
      timeTo: new Date('2020-02-01T17:00:00.000Z'),
      approved: '',
    }, () => {
      store.closeDatabase();
    });
  });
});
