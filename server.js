require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Import Routes
const movieRoutes = require('./routes/movies');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('src')); // Serve Frontend

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB Connection Error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));