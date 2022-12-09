const router = require('express').Router();
const userRouter = require('./userRouter');
const socialMediaRouter = require('./socialMediaRouter');
const errorMiddleware = require('./../middlewares/errorMiddleware');

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Selamat datang di API' });
});
router.use('/users', userRouter);
router.use('/socialmedias', socialMediaRouter);

router.use(errorMiddleware);

module.exports = router;
