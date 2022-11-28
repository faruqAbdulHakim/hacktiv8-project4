const bcrypt = require('bcrypt');

const bcryptHelper = {
  hashPassword: (passwordString) => {
    const salt = bcrypt.genSaltSync(12);
    return bcrypt.hashSync(passwordString, salt);
  },

  comparePassword: (passwordString, encryptedPassword) => {
    return bcrypt.compareSync(passwordString, encryptedPassword);
  },
};

module.exports = bcryptHelper;
