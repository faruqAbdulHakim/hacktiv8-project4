'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Photo extends Model {
    static associate(models) {
      Photo.belongsTo(models.User);
      Photo.hasMany(models.Comment);
    }
  }
  Photo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Title cannot be ommitted',
          },
          notEmpty: {
            msg: 'Title cannot be an empty string',
          },
        },
      },
      caption: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Caption cannot be ommitted',
          },
          notEmpty: {
            msg: 'Caption cannot be an empty sting',
          },
        },
      },
      poster_image_url: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          isUrl: {
            msg: 'Wrong url format',
          },
          notNull: {
            msg: 'Url poster image cannot be ommitted',
          },
          notEmpty: {
            msg: 'Url poster image cannot be an empty string',
          },
        },
      },
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'User Id cannot be ommitted',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Photo',
    }
  );
  return Photo;
};
