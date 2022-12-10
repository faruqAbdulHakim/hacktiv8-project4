const { Comment, Photo, User } = require('./../models/index');

const CommentController = {
  findAll: async (req, res, next) => {
    try {
      const comments = await Comment.findAll({
        attributes: {
          exclude: ['PhotoId', 'UserId'],
        },
        include: [
          {
            model: Photo,
            attributes: ['id', 'title', 'caption', 'poster_image_url'],
          },
          {
            model: User,
            attributes: ['id', 'username', 'profile_image_url', 'phone_number'],
          },
        ],
      });
      res.status(200).json({ comments: comments });
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const { comment, PhotoId } = req.body;
      const UserId = req.user.id;
      const result = await Comment.create({
        comment,
        PhotoId,
        UserId,
      });
      res.status(201).json({ comment: result });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const { comment } = req.body;
      if (!comment) throw { name: 'BadRequest' };
      const result = await Comment.update(
        { comment },
        { where: { id: commentId }, returning: true }
      );

      if (result[0] === 0) {
        res.status(400).json({
          message: 'No Comments updated',
        });
      } else {
        res.status(200).json({ comment: result[1][0] });
      }
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { commentId } = req.params;
      await Comment.destroy({ where: { id: commentId } });
      res
        .status(200)
        .json({ message: 'Your comment has been successfully deleted' });
    } catch (error) {
      next(error);
    }
  },

  authorize: async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const comment = await Comment.findOne({ where: { id: commentId } });
      if (!comment) {
        res.status(404).json({
          name: 'Data Not Found',
          message: `Comment with id "${commentId}" not found`,
        });
      } else if (comment.UserId === req.user.id) {
        next();
      } else {
        res.status(403).json({
          name: 'Authorization Error',
          message: `User with id "${req.user.id}" does not have permission to access Comment with id "${commentId}"`,
        });
      }
    } catch (error) {
      next(error);
    }
  },
};

module.exports = CommentController;
