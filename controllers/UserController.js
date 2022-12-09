const { User } = require('./../models/index');
const bcryptHelper = require('../helpers/bcryptHelper');
const jwtHelper = require('../helpers/jwtHelper');

const UserController = {
  register: async (req, res, next) => {
    try {
      const {
        email,
        full_name,
        username,
        password,
        profile_image_url,
        age,
        phone_number,
      } = req.body;

      const createdUser = await User.create({
        email,
        full_name,
        username,
        password,
        profile_image_url,
        age,
        phone_number,
      });

      res.status(201).json({
        user: {
          email: createdUser.email,
          full_name: createdUser.full_name,
          username: createdUser.username,
          profile_image_url: createdUser.profile_image_url,
          age: createdUser.age,
          phone_number: createdUser.phone_number,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email: email || '' } });
      if (!user) {
        return res.status(400).json({ message: 'Email tidak ditemukan.' });
      }
      if (!bcryptHelper.comparePassword(password || '', user.password)) {
        return res.status(400).json({ message: 'Password salah.' });
      }
      const token = jwtHelper.sign({ id: user.id });
      res.status(200).json({ token });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const userId = req.params.userId;
      const {
        email,
        full_name,
        username,
        profile_image_url,
        age,
        phone_number,
      } = req.body;
      await User.update(
        {
          email: email || '',
          full_name: full_name || '',
          username: username || '',
          profile_image_url: profile_image_url || '',
          age: age || '',
          phone_number: phone_number || '',
        },
        { where: { id: userId } }
      );
      res.status(200).json({
        user: {
          email,
          full_name,
          username,
          profile_image_url,
          age,
          phone_number,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      await User.destroy({ where: { id: req.params.userId } });
      res
        .status(200)
        .json({ message: 'Your account has been successfully deleted' });
    } catch (error) {
      next(error);
    }
  },

  authorize: async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res
          .status(401)
          .json({ message: 'Silahkan login terlebih dahulu.' });
      }
      const userId = req.params.userId;
      if (user.id != userId) {
        return res.status(403).json({
          message: 'Tidak memiliki hak untuk mengubah data milik user lain.',
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = UserController;
