const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    year: String,
    director: String,
    posterUrl: String,
    trailerId: String,
    tmdbRating: Number,
    overview: String,
    actors: [String],
    ratings: { imdb: String, rt: String },
    soundtrack: [{ title: String, duration: String, ytId: String }],
    gallery: [String]
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
