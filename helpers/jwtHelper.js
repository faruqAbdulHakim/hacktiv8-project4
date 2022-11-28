const jwt = require('jsonwebtoken');

const jwtHelper = {
  sign: (payload, options) => {
    const SECRET_TOKEN = process.env.SECRET_TOKEN;
    return jwt.sign(payload, SECRET_TOKEN, options);
  },

  verify: (token, options) => {
    const SECRET_TOKEN = process.env.SECRET_TOKEN;
    return jwt.verify(token, SECRET_TOKEN, options);
  },
};

module.exports = jwtHelper;
