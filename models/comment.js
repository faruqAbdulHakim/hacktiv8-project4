'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.User);
      Comment.belongsTo(models.Photo);
    }
  }
  Comment.init(
    {
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'User ID cannot be omitted',
          },
          notEmpty: {
            msg: 'User ID cannot be an empty string',
          },
        },
      },
      PhotoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Photo ID cannot be omitted',
          },
          notEmpty: {
            msg: 'Photo ID cannot be an empty string',
          },
        },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Comment cannot be omitted',
          },
          notEmpty: {
            msg: 'Comment cannot be an empty string',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Comment',
    }
  );
  return Comment;
};
