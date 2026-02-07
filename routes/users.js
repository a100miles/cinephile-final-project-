const express = require('express');
const router = express.Router();

const {
    getProfile,
    updateProfile,
    toggleFavorite,
    deleteFavorite
} = require('../controllers/userController');

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.put('/favorites', toggleFavorite);
router.delete('/favorites/:source/:movieId', deleteFavorite); // NEW

module.exports = router;
