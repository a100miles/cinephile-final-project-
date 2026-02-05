const express = require('express');
const router = express.Router();
const axios = require('axios');
const Movie = require('../models/Movie');

// 1. SEARCH TMDB
router.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query required" });

    try {
        const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                query: query
            }
        });
        
        const results = response.data.results.slice(0, 5).map(m => ({
            id: m.id,
            title: m.title,
            year: m.release_date ? m.release_date.split('-')[0] : 'N/A',
            poster: m.poster_path ? `https://image.tmdb.org/t/p/w200${m.poster_path}` : null
        }));
        
        res.json(results);
    } catch (err) {
        console.error("TMDB Error:", err.message);
        res.status(500).json({ error: "Failed to fetch from TMDB" });
    }
});

// 2. GET TMDB DETAILS (With YouTube Trailer)
router.get('/tmdb/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const apiKey = process.env.TMDB_API_KEY;

        // Fetch Details, Videos, and Images in parallel
        const [details, videos, images] = await Promise.all([
            axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`),
            axios.get(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`),
            axios.get(`https://api.themoviedb.org/3/movie/${id}/images?api_key=${apiKey}`)
        ]);

        // Find the official YouTube trailer
        const trailer = videos.data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');

        const movieData = {
            title: details.data.title,
            year: details.data.release_date ? details.data.release_date.split('-')[0] : 'N/A',
            director: "Unknown", // TMDB main endpoint doesn't return director, generic fallback
            posterUrl: `https://image.tmdb.org/t/p/original${details.data.poster_path}`,
            trailerId: trailer ? trailer.key : null, // This is the YouTube ID (e.g. "EXeTwQWrcwY")
            ratings: {
                imdb: details.data.vote_average.toFixed(1),
                rt: 'N/A'
            },
            // Use high-res backdrops for the gallery
            gallery: images.data.backdrops.slice(0, 4).map(img => `https://image.tmdb.org/t/p/original${img.file_path}`),
            soundtrack: [] 
        };

        res.json(movieData);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch movie details" });
    }
});

// 3. GET LOCAL DB MOVIE
router.get('/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });
        res.json(movie);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. GET ALL LOCAL MOVIES (Homepage)
router.get('/', async (req, res) => {
    try {
        const movies = await Movie.find();
        res.json(movies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;