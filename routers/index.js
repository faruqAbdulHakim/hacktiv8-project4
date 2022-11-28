const router = require('express').Router();
const usersRouter = require('./usersRouter');
const errorMiddleware = require('./../middlewares/errorMiddleware');

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Selamat datang di API' });
});
router.use('/users', usersRouter);

router.use(errorMiddleware);

module.exports = router;
