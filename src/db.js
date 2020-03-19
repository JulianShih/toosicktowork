import { MongoClient } from 'mongodb';

const store = {};
let client = null;

const setDatabase = (callback) => {
  client = new MongoClient(process.env.DB_CS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  client.connect((err) => {
    if (err) {
      callback(err);
      return;
    }
    store.db = client.db();
    console.log('Database set.');
    callback();
  });
};

const closeDatabase = () => {
  client.close();
  console.log('Database closed.');
};

store.setDatabase = setDatabase;
store.closeDatabase = closeDatabase;

export default store;
