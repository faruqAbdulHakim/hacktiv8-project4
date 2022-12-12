const { Photo, User, Comment } = require('./../models/index');

exports.photoController = {
  get: async (req, res, next) => {
    try {
      const photos = await Photo.findAll({
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'profile_image_url'],
          },
          {
            model: Comment,
            attributes: ['comment'],
            include: {
              model: User,
              attributes: ['username'],
            },
          },
        ],
      });
      res.status(200).json({
        photos,
      });
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const { title, caption, poster_image_url } = req.body;
      const photo = await Photo.create({
        title,
        caption,
        poster_image_url,
        UserId: req.user.id,
      });
      res.status(201).json({
        id: photo.id,
        title: photo.title,
        caption: photo.caption,
        poster_image_url: photo.poster_image_url,
        UserId: photo.UserId,
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const { photoId } = req.params;
      const { title, caption, poster_image_url } = req.body;
      const photo = await Photo.update(
        {
          title,
          caption,
          poster_image_url,
        },
        {
          where: { id: photoId },
          returning: true,
        }
      );
      res.status(200).json({
        photo: photo[1][0],
      });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { photoId } = req.params;
      await Photo.destroy({
        where: { id: photoId },
      });
      res.status(200).json({
        message: 'Your photo has been successfully deleted',
      });
    } catch (error) {
      next(error);
    }
  },

  authorize: async (req, res, next) => {
    try {
      const { photoId } = req.params;
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          message: 'invalid token',
        });
      }
      const photo = await Photo.findOne({
        where: { id: photoId },
      });

      if (!photo) {
        return res.status(404).json({
          message: "photo doesn't exist",
        });
      }

      if (photo.UserId != user.id) {
        return res.status(403).json({
          message: 'Tidak memiliki hak untuk mengubah photo milik user lain.',
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  },
};
