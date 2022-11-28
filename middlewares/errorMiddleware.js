/**
 * @param {Error} error
 * @param {Request} req
 * @param {Response} res
 * @param {import('express').NextFunction} next
 */
const errorMiddleware = (error, req, res, next) => {
  let code;
  let message;

  switch (error.name) {
    case 'BadRequest':
      code = 400;
      message = 'Bad Request';
      break;
    case 'SequelizeValidationError':
      code = 400;
      message = error.errors.map((e) => e.message);
      break;
    case 'SequelizeUniqueConstraintError':
      code = 400;
      error.errors.map((e) => {
        if (e.message == 'email must be unique') {
          message = 'Email is alredy exist, please replace your email';
        } else {
          message = error.errors.map((e) => e.message);
        }
      });
      break;
    case 'SequelizeForeignKeyConstraintError':
      code = 400;
      if (error.table === 'Comments' && error.index === 'photo_fk') {
        message = "Fail to create comment. Can't find photo";
      } else {
        message = "Can't find relationship between table on database";
      }
      break;
    case 'JsonWebTokenError':
      code = 401;
      message = 'Invalid Token';
      break;
    case 'Invalid Token':
      code = 401;
      message = 'Invalid Token';
      break;
    case 'Unauthorized':
      code = 401;
      message = 'Unauthorized';
      break;
    case 'Forbidden':
      code = 403;
      message = 'Forbidden, you does not have acces to this resource';
      break;
    case 'userNotFound':
      code = 404;
      message = 'Fail, Login User not found';
      break;
    case 'CommentNotFound':
      code = 404;
      message = 'Fail, Comment not found';
      break;
    case 'SocialMediaNotFound':
      code = 404;
      message = 'Fail, Social Media not found';
      break;
    case 'PageNotFound':
      code = 404;
      message = '404 Page Not Found';
      break;
    case 'WrongPassword':
      code = 400;
      message = 'Fail, Your password incorrect';
      break;
    default:
      code = 500;
      message = 'Internal Server Error';
      break;
  }

  res.status(code).json({ message });
};

module.exports = errorMiddleware;
