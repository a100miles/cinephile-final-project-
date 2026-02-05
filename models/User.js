const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Storing favorites as ObjectIds references the Movie collection [cite: 13]
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }] 
});

module.exports = mongoose.model('User', userSchema);