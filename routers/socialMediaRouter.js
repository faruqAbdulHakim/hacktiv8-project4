const socialMediaRouter = require('express').Router();
const SocialMediaController = require('../controllers/SocialMediaController');
const authMiddleware = require('../middlewares/auth');

socialMediaRouter.use(authMiddleware);
socialMediaRouter.post('/', SocialMediaController.create);
socialMediaRouter.get('/', SocialMediaController.get);
socialMediaRouter.use('/:socialMediaId', SocialMediaController.authorize);
socialMediaRouter.put('/:socialMediaId', SocialMediaController.update);
socialMediaRouter.delete('/:socialMediaId', SocialMediaController.delete);

module.exports = socialMediaRouter;
