const photoRouter = require('express').Router();
const authMiddleware = require('./../middlewares/auth');
const { photoController } = require('./../controllers/PhotoController');

photoRouter.use(authMiddleware);
photoRouter.get('/', photoController.get);
photoRouter.post('/', photoController.create);
photoRouter.use('/:photoId', photoController.authorize);
photoRouter.put('/:photoId', photoController.update);
photoRouter.delete('/:photoId', photoController.delete);

module.exports = photoRouter;
