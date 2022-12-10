const commentsRouter = require('express').Router();
const authMiddleware = require('./../middlewares/authMiddleware');
const CommentController = require('./../controllers/CommentController');

commentsRouter.use(authMiddleware);
commentsRouter.get('/', CommentController.findAll);
commentsRouter.post('/', CommentController.create);
commentsRouter.use('/:commentId', CommentController.authorize);
commentsRouter.put('/:commentId', CommentController.update);
commentsRouter.delete('/:commentId', CommentController.delete);

module.exports = commentsRouter;
