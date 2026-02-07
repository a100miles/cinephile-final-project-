const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
	{
		source: { type: String, enum: ['local', 'tmdb'], required: true },
		movieId: { type: String, required: true },
		title: { type: String, required: true },
		year: { type: String, default: 'N/A' },
		posterUrl: { type: String, default: '' },
		addedAt: { type: Date, default: Date.now }
	},
	{ _id: false }
);

const userSchema = new mongoose.Schema(
	{
		username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 24 },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		password: { type: String, required: true },

		avatarUrl: { type: String, default: '' }, // NEW

		favorites: { type: [favoriteSchema], default: [] }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
