const errorMiddleware = (error, req, res, next) => {
  let code;
  let message;

  switch (error.name) {
    
    case 'SequelizeValidationError':
      code = 400;
      message = error.errors.map((e) => e.message);
      break;
    case 'SequelizeUniqueConstraintError':
      code = 400;
      message = error.errors.map((e) => e.message);
      break;
    case 'SequelizeForeignKeyConstraintError':
      code = 400;
      message = `Fail to create ${error.table}. Data doesn't have any relation`
      break;
    case 'JsonWebTokenError':
      code = 401;
      message = 'Invalid Token'
      break;
    case 'PageNotFound':
      code = 404;
      message = '404 Page Not Found';
      break;
    default:
      code = 500;
      message = 'Internal Server Error';
      break;
  }

  res.status(code).json({ message });
};

module.exports = errorMiddleware;
