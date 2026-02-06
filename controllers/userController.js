const Joi = require('joi');
const User = require('../models/User');

const favSchema = Joi.object({
    source: Joi.string().valid('local', 'tmdb').required(),
    movieId: Joi.string().min(1).required(),
    title: Joi.string().min(1).max(200).required(),
    year: Joi.string().max(10).allow('', null).default('N/A'),
    posterUrl: Joi.string().allow('', null).default('')
});

async function getProfile(req, res) {
    const user = await User.findById(req.user.id).select('username email favorites');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
        username: user.username,
        email: user.email,
        favorites: (user.favorites || []).slice(0, 5)
    });
}

async function updateProfile(req, res) {
    const schema = Joi.object({
        username: Joi.string().min(3).max(24).optional()
    });

    const { error, value } = schema.validate(req.body, { abortEarly: true, stripUnknown: true });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (value.username) user.username = value.username;
    await user.save();

    res.json({ message: 'Profile updated', username: user.username, email: user.email });
}

async function toggleFavorite(req, res) {
    const { error, value } = favSchema.validate(req.body, { abortEarly: true, stripUnknown: true });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { source, movieId } = value;

    const idx = user.favorites.findIndex(f => f.source === source && String(f.movieId) === String(movieId));

    if (idx >= 0) {
        user.favorites.splice(idx, 1);
    } else {
        user.favorites.unshift(value);
        if (user.favorites.length > 5) user.favorites = user.favorites.slice(0, 5);
    }

    await user.save();

    res.json({ favorites: user.favorites.slice(0, 5) });
}

module.exports = { getProfile, updateProfile, toggleFavorite };
