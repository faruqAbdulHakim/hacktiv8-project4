const { User } = require('./../models/index');

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
};

module.exports = UserController;
