import express from 'express';
import authenticate from './middlewares/authenticate';

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res) => {
  res.sendStatus(200);
});

export default router;
