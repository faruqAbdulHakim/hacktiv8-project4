const { SocialMedia, User } = require('./../models/index');

const SocialMediaController = {
  create: async (req, res, next) => {
    try {
      const { name, social_media_url } = req.body;
      const createdSocialMedia = await SocialMedia.create({
        name,
        social_media_url,
        UserId: req.user.id,
      });
      res.status(201).json({ social_media: createdSocialMedia });
    } catch (error) {
      next(error);
    }
  },

  get: async (req, res, next) => {
    try {
      const socialMedias = await SocialMedia.findAll({
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'profile_image_url'],
          },
        ],
      });
      res.status(200).json({ social_medias: socialMedias });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const { name, social_media_url } = req.body;
      const updatedSocialMedia = await SocialMedia.update(
        { name: name || '', social_media_url: social_media_url || '' },
        {
          where: {
            id: req.params.socialMediaId,
          },
          returning: [
            'id',
            'name',
            'social_media_url',
            'UserId',
            'updatedAt',
            'createdAt',
          ],
        }
      );
      if (updatedSocialMedia[0] === 0) {
        return res.status(400).json({ message: 'Tidak ada yang diupdate' });
      }
      res.status(200).json({ social_media: updatedSocialMedia[1][0] });
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      await SocialMedia.destroy({
        where: {
          id: req.params.socialMediaId,
        },
      });
      res.status(200).json({ message: 'Your social media has been successfully deleted' });
    } catch (error) {
      next(error);
    }
  },
  authorize: async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res
          .status(401)
          .json({ message: 'Silahkan login terlebih dahulu.' });
      }
      const socialMedia = await SocialMedia.findOne({
        where: {
          id: req.params.socialMediaId,
        },
      });
      if (!socialMedia) {
        return res.status(404).json({
          message: 'Social Media tidak ditemukan',
        });
      }
      if (socialMedia.UserId != user.id) {
        return res.status(403).json({
          message:
            'Tidak memiliki hak untuk mengubah social media milik user lain.',
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = SocialMediaController;
