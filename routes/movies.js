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
	getTMDBDetails,
	nowPlayingTMDB // NEW
} = require('../controllers/movieController');

router.get('/public', getAllPublic);
router.get('/public/:id', getOnePublic);

router.get('/search', searchTMDB);
router.get('/tmdb/:id', getTMDBDetails);

// NEW (public)
router.get('/now-playing', nowPlayingTMDB);

router.post('/', auth, createMovie);
router.put('/:id', auth, updateMovie);
router.delete('/:id', auth, deleteMovie);

module.exports = router;
