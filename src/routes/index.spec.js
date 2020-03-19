import request from 'supertest';
import Core from '../Core';
import store from '../db';
import indexRouter from './index';

const core = new Core();

describe('GET /', () => {
  before((done) => {
    store.setDatabase((err) => {
      core.setRouter('/', indexRouter);
      core.launchServer();
      done(err);
    });
  });
  it('should respond 200 if successfully authenticated', (done) => {
    request(core.app)
      .get('/')
      .auth('root', 'root')
      .expect(200, done);
  });
  it('should respond 401 if authentication failed', (done) => {
    request(core.app)
      .get('/')
      .auth('alpha', 'omega')
      .expect(401, done);
  });
  after(() => {
    store.closeDatabase();
  });
});
