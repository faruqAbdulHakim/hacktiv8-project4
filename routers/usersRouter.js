const usersRouter = require('express').Router();
const userController = require('./../controllers/UserController');

usersRouter.post('/register', userController.register);

module.exports = usersRouter;
