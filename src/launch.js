import Core from './Core';
import store from './db';
import indexRouter from './routes/index';
import userRouter from './routes/users';
import leaveRouter from './routes/leaves';

const core = new Core();

store.setDatabase((err) => {
  if (err) {
    throw err;
  }
  core.setRouter('/login', indexRouter);
  core.setRouter('/users', userRouter);
  core.setRouter('/leaves', leaveRouter);
  core.launchServer();
});
