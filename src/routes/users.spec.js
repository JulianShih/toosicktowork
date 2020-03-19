import request from 'supertest';
import Core from '../Core';
import store from '../db';
import usersRouter from './users';

const core = new Core();

describe('GET /users', () => {
  before((done) => {
    store.setDatabase((err) => {
      core.setRouter('/users', usersRouter);
      done(err);
    });
  });
  it('should respond 401 if without authentication', (done) => {
    request(core.app)
      .get('/users')
      .expect(401, done);
  });
  it('should respond 401 if auth is empty', (done) => {
    request(core.app)
      .get('/users')
      .auth('', '')
      .expect(401, done);
  });
  it('should respond 401 if password not match', (done) => {
    request(core.app)
      .get('/users')
      .auth('joseph', 'franz')
      .expect(401, done);
  });
  it('should respond 401 if can be decoded by base64 and user not found', (done) => {
    request(core.app)
      .get('/users')
      .auth('哈囉世界', '我是密碼')
      .expect(401, done);
  });
  it('should not respond password and _id if userdata found', (done) => {
    request(core.app)
      .get('/users')
      .auth('salieri', 'antonio')
      .expect([{ username: 'salieri', supervisor: 'joseph' }], done);
  });
});

describe('POST /users', () => {
  it('should be forbidden to add new user if not superuser', (done) => {
    request(core.app)
      .post('/users')
      .auth('salieri', 'antonio')
      .set('content-type', 'application/json')
      .send('{"username":"beethoven", "password":"mozart"}')
      .expect(403, done);
  });
  it('should add new user if is superuser', (done) => {
    request(core.app)
      .post('/users')
      .auth('root', 'root')
      .set('content-type', 'application/json')
      .send('{"username":"lucio", "password":"doge", "supervisor": "root"}')
      .expect(200, done);
  });
  it('should update user if already exist', (done) => {
    request(core.app)
      .post('/users')
      .auth('root', 'root')
      .set('content-type', 'application/json')
      .send('{"username":"lucio", "password":"antonio", "supervisor": "root"}')
      .expect(200, done);
  });
  it('should be forbidden to add new user if supervisor not exist', (done) => {
    request(core.app)
      .post('/users')
      .auth('root', 'root')
      .set('content-type', 'application/json')
      .send('{"username":"beethoven", "password":"bbb", "supervisor": "mozart"}')
      .expect(403, done);
  });
});


describe('delete /users', () => {
  it('should be forbidden to delete user if not superuser', (done) => {
    request(core.app)
      .delete('/users/cat')
      .auth('salieri', 'antonio')
      .expect(403, done);
  });
  it('should be forbidden to delete superuser', (done) => {
    request(core.app)
      .delete('/users/root')
      .auth('root', 'root')
      .expect(403, done);
  });
  it('should be forbidden to delete user if is supervisor', (done) => {
    request(core.app)
      .delete('/users/joseph')
      .auth('root', 'root')
      .expect(403, done);
  });
  it('should respond 404 when attempting to delete user which is not exist', (done) => {
    request(core.app)
      .delete('/users/beaumarchais')
      .auth('root', 'root')
      .expect(404, done);
  });
  it('should delete end users', (done) => {
    request(core.app)
      .post('/users')
      .auth('root', 'root')
      .set('content-type', 'application/json')
      .send('{"username":"sussmayr", "password":"req", "supervisor": "salieri"}')
      .expect(200, () => {
        request(core.app)
          .delete('/users/sussmayr')
          .auth('root', 'root')
          .expect(200, done);
      });
  });
  after(() => {
    store.db.collection('users').deleteOne({ username: 'lucio' }, () => {
      store.closeDatabase();
    });
  });
});
