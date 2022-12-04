'use strict';
import { TEXT } from './../node_modules/sequelize/types/data-types.d';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Photo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // association table photo
      Photo.belongsTo(models.User);
      Photo.hasMany(models.Comemnt);
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
