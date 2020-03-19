import express from 'express';

class Core {
  constructor() {
    this.app = express();
    this.port = '5000';
  }

  setRouter(path, router) {
    this.app.use(express.json());
    this.app.use(path, router);
  }

  launchServer() {
    this.app.set('port', this.port);
    this.app.listen(this.port);
    console.log(`Listening from port ${this.port}`);
  }
}

export default Core;
