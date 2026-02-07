const axios = require('axios');
const Joi = require('joi');
const Movie = require('../models/Movie');

const createMovieSchema = Joi.object({
    title: Joi.string().min(1).max(120).required(),
    year: Joi.string().max(10).allow('', null),
    director: Joi.string().max(80).allow('', null),
    posterUrl: Joi.string().uri().allow('', null),
    trailerId: Joi.string().max(32).allow('', null),
    tmdbRating: Joi.number().min(0).max(10).allow(null),
    overview: Joi.string().max(2000).allow('', null),
    actors: Joi.array().items(Joi.string().max(60)).max(20).default([]),
    soundtrack: Joi.array().items(Joi.object({
        title: Joi.string().max(120).required(),
        duration: Joi.string().max(16).allow('', null),
        ytId: Joi.string().max(32).allow('', null)
    })).default([]),
    gallery: Joi.array().items(Joi.string().uri()).max(12).default([])
});

async function getAllPublic(req, res) {
    const movies = await Movie.find().sort({ createdAt: -1 }).select('title year director posterUrl');
    res.json(movies);
}

async function getOnePublic(req, res) {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
}

// CRUD (private)
async function createMovie(req, res) {
    const { error, value } = createMovieSchema.validate(req.body, { abortEarly: true, stripUnknown: true });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const movie = await Movie.create(value);
    res.status(201).json(movie);
}

async function updateMovie(req, res) {
    const { error, value } = createMovieSchema.fork(['title'], s => s.optional()).validate(req.body, { abortEarly: true, stripUnknown: true });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const movie = await Movie.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
}

async function deleteMovie(req, res) {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json({ message: 'Movie deleted' });
}

// TMDB search
async function searchTMDB(req, res) {
    const query = req.query.q;
    if (!query || query.trim().length < 2) return res.status(400).json({ error: 'Query required' });

    const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
        params: { api_key: process.env.TMDB_API_KEY, query }
    });

    const results = (response.data.results || []).slice(0, 7).map(m => ({
        id: m.id,
        title: m.title,
        year: m.release_date ? m.release_date.split('-')[0] : 'N/A',
        poster: m.poster_path ? `https://image.tmdb.org/t/p/w200${m.poster_path}` : null
    }));

    res.json(results);
}

// TMDB details + credits + images + trailer
async function getTMDBDetails(req, res) {
    const { id } = req.params;
    const apiKey = process.env.TMDB_API_KEY;

    const [details, videos, images, credits] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${id}`, { params: { api_key: apiKey } }),
        axios.get(`https://api.themoviedb.org/3/movie/${id}/videos`, { params: { api_key: apiKey } }),
        axios.get(`https://api.themoviedb.org/3/movie/${id}/images`, { params: { api_key: apiKey } }),
        axios.get(`https://api.themoviedb.org/3/movie/${id}/credits`, { params: { api_key: apiKey } })
    ]);

    const trailer = (videos.data.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const director = (credits.data.crew || []).find(c => c.job === 'Director')?.name || 'Unknown';
    const actors = (credits.data.cast || []).slice(0, 8).map(a => a.name);

    res.json({
        title: details.data.title,
        year: details.data.release_date ? details.data.release_date.split('-')[0] : 'N/A',
        director,
        overview: details.data.overview || '',
        actors,
        posterUrl: details.data.poster_path ? `https://image.tmdb.org/t/p/original${details.data.poster_path}` : '',
        trailerId: trailer ? trailer.key : null,
        tmdbRating: typeof details.data.vote_average === 'number' ? Number(details.data.vote_average.toFixed(1)) : null,
        ratings: { imdb: typeof details.data.vote_average === 'number' ? details.data.vote_average.toFixed(1) : 'N/A', rt: 'N/A' },
        gallery: (images.data.backdrops || []).slice(0, 6).map(img => `https://image.tmdb.org/t/p/original${img.file_path}`),
        soundtrack: []
    });
}

async function nowPlayingTMDB(req, res) {
	const apiKey = process.env.TMDB_API_KEY;
	const page = Number(req.query.page || 1);
	const region = (req.query.region || 'default').toUpperCase(); 
	const language = req.query.language || 'en-US';

	try {
		const response = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
			params: {
				api_key: apiKey,
				page,
				region,
				language
			},
			timeout: 12000
		});

		const results = (response.data.results || []).slice(0, 12).map((m) => ({
			id: m.id,
			title: m.title,
			year: m.release_date ? m.release_date.split('-')[0] : 'N/A',
			overview: m.overview || '',
			rating: typeof m.vote_average === 'number' ? Number(m.vote_average.toFixed(1)) : null,
			posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
			backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : ''
		}));

		res.json(results);
	} catch (err) {
		console.error('Now Playing error:', err.message);
		res.status(500).json({ error: 'Failed to fetch now playing' });
	}
}

module.exports = {
    getAllPublic,
    getOnePublic,
    createMovie,
    updateMovie,
    deleteMovie,
    searchTMDB,
    getTMDBDetails,
    nowPlayingTMDB
};
