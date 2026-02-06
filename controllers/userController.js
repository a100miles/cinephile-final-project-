const Joi = require('joi');
const User = require('../models/User');

const updateProfileSchema = Joi.object({
    username: Joi.string().min(3).max(24).optional()
});

async function getProfile(req, res) {
    const user = await User.findById(req.user.id).populate('favorites', 'title posterUrl year director');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
        username: user.username,
        favorites: (user.favorites || []).slice(0, 5)
    });
}

async function updateProfile(req, res) {
    const { error, value } = updateProfileSchema.validate(req.body, { abortEarly: true, stripUnknown: true });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (value.username) user.username = value.username;
    await user.save();

    res.json({ message: 'Profile updated', username: user.username });
}

async function toggleFavorite(req, res) {
    const { movieId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const exists = user.favorites.some(id => String(id) === String(movieId));

    if (exists) {
        user.favorites = user.favorites.filter(id => String(id) !== String(movieId));
    } else {
        user.favorites.unshift(movieId);
        if (user.favorites.length > 5) user.favorites = user.favorites.slice(0, 5);
    }

    await user.save();
    const populated = await User.findById(req.user.id).populate('favorites', 'title posterUrl year director');

    res.json({ favorites: populated.favorites.slice(0, 5) });
}

module.exports = { getProfile, updateProfile, toggleFavorite };
