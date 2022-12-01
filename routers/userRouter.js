const userRouter = require('express').Router();
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middlewares/auth');

userRouter.post('/register', UserController.register);
userRouter.post('/login', UserController.login);
userRouter.put(
  '/:userId',
  authMiddleware,
  UserController.authorize,
  UserController.update
);
userRouter.delete(
  '/:userId',
  authMiddleware,
  UserController.authorize,
  UserController.delete
);

module.exports = userRouter;
