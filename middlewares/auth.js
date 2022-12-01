const jwtHelper = require('../helpers/jwtHelper');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers['token'];
    if (!token) {
      return res.status(401).json({ message: 'Memerlukan header token' });
    }
    const user = jwtHelper.verify(token);
    if (!user.id) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = { id: user.id };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
