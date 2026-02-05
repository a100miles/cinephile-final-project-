const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    year: String,
    director: String,
    posterUrl: String,
    trailerId: String,
    ratings: { imdb: String, rt: String },
    soundtrack: [{ title: String, duration: String }],
    gallery: [String]
});

module.exports = mongoose.model('Movie', movieSchema);