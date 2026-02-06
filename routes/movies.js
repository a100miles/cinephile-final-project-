const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getAllPublic,
    getOnePublic,
    createMovie,
    updateMovie,
    deleteMovie,
    searchTMDB,
    getTMDBDetails
} = require('../controllers/movieController');

// Public browsing
router.get('/public', getAllPublic);
router.get('/public/:id', getOnePublic);

// TMDB (external API)
router.get('/search', searchTMDB);
router.get('/tmdb/:id', getTMDBDetails);

// Private CRUD (for grading requirements)
router.post('/', auth, createMovie);
router.put('/:id', auth, updateMovie);
router.delete('/:id', auth, deleteMovie);

module.exports = router;
