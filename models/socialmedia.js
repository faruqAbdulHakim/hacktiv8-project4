'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SocialMedia extends Model {
    static associate(models) {
      SocialMedia.belongsTo(models.User);
    }
  }
  SocialMedia.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Name cannot be omitted',
          },
          notEmpty: {
            msg: 'Name cannot be an empty string',
          },
        },
      },
      social_media_url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Social Media URL cannot be omitted',
          },
          notEmpty: {
            msg: 'Social Media URL cannot be an empty string',
          },
          isUrl: {
            msg: 'Social Media URL must be in URL format',
          },
        },
      },
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
    },
    {
      sequelize,
      modelName: 'SocialMedia',
    }
  );
  return SocialMedia;
};
