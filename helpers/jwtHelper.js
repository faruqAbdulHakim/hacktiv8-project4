const jwt = require('jsonwebtoken');
const SECRET_TOKEN = process.env.SECRET_TOKEN || 'secret';

const jwtHelper = {
  sign: (payload, options) => {
    return jwt.sign(payload, SECRET_TOKEN, options);
  },

  verify: (token, options) => {
    return jwt.verify(token, SECRET_TOKEN, options);
  },
};

module.exports = jwtHelper;
