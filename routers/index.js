const router = require('express').Router();

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Selamat datang di API' });
});

module.exports = router;
