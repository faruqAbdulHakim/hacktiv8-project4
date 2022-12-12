const { Comment, Photo, User } = require('./../models/index');

class CommentController {
  /**
   * @param {Request} req
   * @param {Response} res
   * @param {import('express').NextFunction} next
   */
  static async findAll(req, res, next) {
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
      res.status(200).json({
        comments: comments.map((comment) => {
          return {
            ...comment.dataValues,
            UserId: comment.User.id,
            PhotoId: comment.Photo.id,
          };
        }),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @param {Request} req
   * @param {Response} res
   * @param {import('express').NextFunction} next
   */
  static async create(req, res, next) {
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
  }

  /**
   * @param {Request} req
   * @param {Response} res
   * @param {import('express').NextFunction} next
   */
  static async update(req, res, next) {
    try {
      const { commentId } = req.params;

      const { comment } = req.body;
      const result = await Comment.update(
        { comment: comment || '' },
        { where: { id: commentId }, returning: true }
      );

      if (result[0] === 0) {
        return res.status(400).json({
          message: 'No Comments updated',
        });
      }
      res.status(200).json({ comment: result[1][0] });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @param {Request} req
   * @param {Response} res
   * @param {import('express').NextFunction} next
   */
  static async delete(req, res, next) {
    try {
      const { commentId } = req.params;
      await Comment.destroy({ where: { id: commentId } });
      res
        .status(200)
        .json({ message: 'Your comment has been successfully deleted' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @param {Request} req
   * @param {Response} res
   * @param {import('express').NextFunction} next
   */
  static async authorize(req, res, next) {
    try {
      const user = req.user;
      if (!user) {
        return res
          .status(401)
          .json({ message: 'silahkan login terlebih dahulu' });
      }

      const { commentId } = req.params;
      const comment = await Comment.findOne({ where: { id: commentId } });
      if (!comment) {
        return res.status(404).json({
          // name: 'Data Not Found',
          message: `Comment not found`,
        });
      }
      if (comment.UserId != user.id) {
        return res.status(403).json({
          // name: 'Authorization Error',
          // message: `User with id "${req.user.id}" does not have permission to access Comment with id "${commentId}"`,
          message:
            'Tidak memiliki hak untuk mengubah social media milik user lain.',
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CommentController;
