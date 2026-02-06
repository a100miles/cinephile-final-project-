const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, toggleFavorite } = require('../controllers/userController');

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/favorites/:movieId', toggleFavorite);

module.exports = router;
