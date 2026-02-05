const fs = require('fs');
const path = require('path');

// 1. CREATE DIRECTORIES
const dirs = ['models', 'routes', 'src', 'middleware'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// 2. DEFINE FILE CONTENTS
const files = {
    'models/User.js': `const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});
module.exports = mongoose.model('User', userSchema);`,

    'models/Movie.js': `const mongoose = require('mongoose');
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
module.exports = mongoose.model('Movie', movieSchema);`,

    'routes/auth.js': `const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User created' });
    } catch (err) { res.status(500).json({ error: 'Username exists' }); }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: 'User not found' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, username: user.username });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;`,

    'routes/movies.js': `const express = require('express');
const router = express.Router();
const axios = require('axios');
const Movie = require('../models/Movie');

// SEARCH TMDB
router.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query required" });
    try {
        const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
            params: { api_key: process.env.TMDB_API_KEY, query: query }
        });
        const results = response.data.results.slice(0, 5).map(m => ({
            id: m.id,
            title: m.title,
            year: m.release_date ? m.release_date.split('-')[0] : 'N/A',
            poster: m.poster_path ? 'https://image.tmdb.org/t/p/w200' + m.poster_path : null
        }));
        res.json(results);
    } catch (err) { res.status(500).json({ error: "TMDB API Error" }); }
});

// GET TMDB DETAILS
router.get('/tmdb/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const apiKey = process.env.TMDB_API_KEY;
        const [details, videos, images] = await Promise.all([
            axios.get('https://api.themoviedb.org/3/movie/' + id + '?api_key=' + apiKey),
            axios.get('https://api.themoviedb.org/3/movie/' + id + '/videos?api_key=' + apiKey),
            axios.get('https://api.themoviedb.org/3/movie/' + id + '/images?api_key=' + apiKey)
        ]);
        const trailer = videos.data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        res.json({
            title: details.data.title,
            year: details.data.release_date.split('-')[0],
            director: "Unknown",
            posterUrl: 'https://image.tmdb.org/t/p/original' + details.data.poster_path,
            trailerId: trailer ? trailer.key : null,
            ratings: { imdb: details.data.vote_average.toFixed(1), rt: 'N/A' },
            gallery: images.data.backdrops.slice(0, 4).map(img => 'https://image.tmdb.org/t/p/original' + img.file_path),
            soundtrack: []
        });
    } catch (err) { res.status(500).json({ error: "Fetch error" }); }
});

// GET LOCAL DB MOVIE
router.get('/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if(!movie) return res.status(404).json({message: "Not found"});
        res.json(movie);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET ALL MOVIES (Homepage)
router.get('/', async (req, res) => {
    try {
        const movies = await Movie.find();
        res.json(movies);
    } catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;`,

    'src/index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NOCTURNE ARCHIVE</title>
    <link href="./output.css" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.2/axios.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600&family=Playfair+Display:ital,wght@0,400;1,400&display=swap');
        body { background-color: #050505; color: #a3a3a3; font-family: 'Inter', sans-serif; filter: sepia(10%) contrast(105%); }
        .serif { font-family: 'Playfair Display', serif; }
    </style>
</head>
<body class="antialiased min-h-screen pb-32">
    <nav class="fixed top-0 w-full z-50 bg-black/90 border-b border-gray-800 backdrop-blur-md px-8 py-4 flex justify-between items-center">
        <div class="text-white serif italic text-xl">Nocturne</div>
        <div id="auth-section" class="flex gap-4 text-xs uppercase tracking-widest items-center"></div>
    </nav>
    <header class="text-center pt-40 pb-20 px-4">
        <h1 class="text-white text-5xl md:text-8xl font-light serif italic tracking-tighter mb-8">Nocturne</h1>
        <div class="max-w-xl mx-auto relative group z-40">
            <input type="text" id="search-input" placeholder="Search archive..." 
                class="w-full bg-gray-900/50 border border-gray-800 rounded-full px-6 py-3 text-white focus:outline-none focus:border-gray-500 transition text-center serif italic placeholder-gray-700">
            <div id="search-results" class="absolute top-14 left-0 w-full bg-black border border-gray-800 rounded-xl overflow-hidden hidden shadow-2xl"></div>
        </div>
    </header>
    <main class="max-w-6xl mx-auto px-6">
        <h3 class="text-xs uppercase tracking-[0.4em] text-gray-600 mb-8 border-b border-gray-900 pb-2">Curated Collection</h3>
        <div id="db-movies" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"></div>
    </main>
    <script>
        const API_URL = '/api';
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        const authDiv = document.getElementById('auth-section');
        if (token && username) {
            authDiv.innerHTML = '<span class="text-gray-500 hidden md:block">User: '+username+'</span><button onclick="logout()" class="text-white hover:text-red-500 ml-4 border border-gray-800 px-3 py-1 rounded-full">Logout</button>';
        } else {
            authDiv.innerHTML = '<a href="login.html" class="hover:text-white">Login</a><a href="signup.html" class="border border-gray-600 px-4 py-1 rounded-full hover:bg-white hover:text-black transition">Sign Up</a>';
        }
        function logout() { localStorage.clear(); location.reload(); }
        const searchInput = document.getElementById('search-input');
        const resultsBox = document.getElementById('search-results');
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => performSearch(e.target.value), 400);
        });
        async function performSearch(query) {
            if (query.length < 2) { resultsBox.classList.add('hidden'); return; }
            try {
                const res = await axios.get(API_URL + '/movies/search?q=' + query);
                if (res.data.length === 0) { resultsBox.classList.add('hidden'); return; }
                resultsBox.innerHTML = res.data.map(m => '<a href="movie.html?tmdbId='+m.id+'" class="flex gap-4 p-4 hover:bg-gray-900 border-b border-gray-800 transition items-center"><img src="'+(m.poster || 'https://via.placeholder.com/40')+'" class="w-10 h-14 object-cover grayscale opacity-70"><div class="text-left"><h4 class="text-white text-sm serif italic">'+m.title+'</h4><p class="text-xs text-gray-500 font-mono">'+m.year+'</p></div></a>').join('');
                resultsBox.classList.remove('hidden');
            } catch (err) { console.error(err); }
        }
        async function loadLocalMovies() {
            try {
                const res = await axios.get(API_URL + '/movies');
                document.getElementById('db-movies').innerHTML = res.data.map(m => '<a href="movie.html?id='+m._id+'" class="group block"><div class="aspect-[2/3] bg-gray-900 border border-gray-800 relative overflow-hidden mb-6"><img src="'+m.posterUrl+'" class="w-full h-full object-cover opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition duration-700 ease-out"></div><h2 class="text-2xl text-white serif italic group-hover:text-gray-300 transition">'+m.title+'</h2><div class="flex justify-between items-center mt-2 border-t border-gray-900 pt-2"><span class="text-xs text-gray-600 font-mono uppercase tracking-widest">'+m.director+'</span><span class="text-xs text-gray-700 font-mono">'+m.year+'</span></div></a>').join('');
            } catch (err) { console.error("DB Load Error", err); }
        }
        loadLocalMovies();
    </script>
</body>
</html>`,

    'src/movie.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Details - NOCTURNE</title>
    <link href="./output.css" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600&family=Playfair+Display:ital,wght@0,400;1,400&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #050505; color: #a3a3a3; filter: sepia(10%) contrast(105%); }
        .serif { font-family: 'Playfair Display', serif; }
        .video-wrapper { pointer-events: none; overflow: hidden; }
        .video-iframe { transform: scale(1.5); width: 100%; height: 100%; }
    </style>
</head>
<body class="antialiased min-h-screen selection:bg-white selection:text-black">
    <nav class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-black/90 border border-gray-800 rounded-full px-2 py-2 flex gap-2 backdrop-blur-md">
        <a href="index.html" class="px-6 py-2 rounded-full hover:bg-white hover:text-black transition duration-300 text-[10px] tracking-[0.25em] uppercase border border-transparent hover:border-black flex items-center gap-2"><span>← Return</span></a>
    </nav>
    <div id="movie-content" class="opacity-0 transition-opacity duration-1000">
        <div class="relative w-full h-[85vh] border-b border-gray-900 video-wrapper">
            <iframe id="hero-frame" class="video-iframe grayscale opacity-60" frameborder="0" allow="autoplay; encrypted-media"></iframe>
            <div class="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
            <div class="absolute bottom-0 left-0 w-full p-8 md:p-20">
                <h1 id="movie-title" class="text-6xl md:text-9xl text-white serif italic mb-6 leading-none tracking-tight"></h1>
                <div class="flex gap-4 text-[10px] font-mono tracking-[0.2em] uppercase text-gray-400">
                    <span id="movie-year"></span> • <span id="movie-director"></span>
                </div>
            </div>
        </div>
        <div class="max-w-5xl mx-auto px-6 py-24 space-y-32">
            <section><h3 class="text-white text-3xl serif italic mb-8 border-b border-gray-800 pb-4">Soundtrack</h3><div id="soundtrack-list" class="space-y-0"></div></section>
            <section><h3 class="text-white text-3xl serif italic mb-8 border-b border-gray-800 pb-4">Gallery</h3><div id="gallery-grid" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div></section>
        </div>
    </div>
    <script>
        async function loadMovie() {
            const params = new URLSearchParams(window.location.search);
            const localId = params.get('id');
            const tmdbId = params.get('tmdbId');
            if (!localId && !tmdbId) return window.location.href = 'index.html';
            try {
                let movie;
                if (tmdbId) {
                    const response = await fetch('/api/movies/tmdb/' + tmdbId);
                    movie = await response.json();
                } else {
                    const response = await fetch('/api/movies/' + localId);
                    movie = await response.json();
                }
                document.title = movie.title.toUpperCase() + ' - NOCTURNE';
                document.getElementById('movie-title').innerText = movie.title;
                document.getElementById('movie-year').innerText = movie.year || 'N/A';
                document.getElementById('movie-director').innerText = movie.director || 'Unknown';
                const frame = document.getElementById('hero-frame');
                if (movie.trailerId) {
                    frame.src = 'https://www.youtube.com/embed/' + movie.trailerId + '?autoplay=1&mute=1&controls=0&loop=1&playlist=' + movie.trailerId + '&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1';
                } else {
                    frame.parentElement.style.backgroundImage = "url('" + movie.posterUrl + "')";
                    frame.parentElement.style.backgroundSize = 'cover';
                    frame.style.display = 'none';
                }
                const soundContainer = document.getElementById('soundtrack-list');
                if (movie.soundtrack && movie.soundtrack.length > 0) {
                    soundContainer.innerHTML = movie.soundtrack.map((track, i) => '<div class="flex justify-between items-center py-5 border-b border-gray-900 hover:bg-white/5 px-4 cursor-pointer group transition duration-300"><div class="flex items-center gap-6"><span class="text-xs font-mono text-gray-600 group-hover:text-white transition">0'+(i+1)+'</span><span class="text-gray-400 group-hover:text-white text-lg serif italic transition">'+track.title+'</span></div><span class="font-mono text-xs text-gray-600">'+(track.duration || '--:--')+'</span></div>').join('');
                } else { soundContainer.innerHTML = '<p class="text-gray-600 text-sm italic py-4">No soundtrack data available.</p>'; }
                const galleryContainer = document.getElementById('gallery-grid');
                if (movie.gallery && movie.gallery.length > 0) {
                    galleryContainer.innerHTML = movie.gallery.map(imgUrl => '<div class="overflow-hidden border border-gray-800 opacity-80 hover:opacity-100 transition duration-700 h-64"><img src="'+imgUrl+'" class="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-700 hover:scale-105"></div>').join('');
                } else { galleryContainer.innerHTML = '<p class="text-gray-600 text-sm italic">No gallery images available.</p>'; }
                document.getElementById('movie-content').classList.remove('opacity-0');
            } catch (error) { console.error('Error:', error); alert("Could not load movie data."); }
        }
        loadMovie();
    </script>
</body>
</html>`,

    'src/login.html': `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Login - Nocturne</title><script src="https://cdn.tailwindcss.com"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.2/axios.min.js"></script></head><body class="bg-[#050505] text-gray-400 h-screen flex items-center justify-center font-sans"><div class="w-full max-w-md p-8 border border-gray-800 rounded-2xl bg-black/50"><h2 class="text-3xl text-white font-serif italic mb-8 text-center">Login</h2><form id="loginForm" class="space-y-6"><input type="text" id="username" placeholder="Username" class="w-full bg-black border border-gray-700 p-3 rounded text-white focus:border-white outline-none"><input type="password" id="password" placeholder="Password" class="w-full bg-black border border-gray-700 p-3 rounded text-white focus:border-white outline-none"><button type="submit" class="w-full bg-white text-black py-3 rounded font-bold uppercase tracking-widest hover:bg-gray-200">Enter Archive</button></form><p class="mt-4 text-center text-xs">No account? <a href="signup.html" class="text-white underline">Sign up</a></p></div><script>document.getElementById('loginForm').addEventListener('submit',async(e)=>{e.preventDefault();try{const res=await axios.post('/api/auth/login',{username:document.getElementById('username').value,password:document.getElementById('password').value});localStorage.setItem('token',res.data.token);localStorage.setItem('username',res.data.username);window.location.href='index.html';}catch(err){alert(err.response?.data?.error||'Login failed');}});</script></body></html>`,
    
    'src/signup.html': `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Sign Up - Nocturne</title><script src="https://cdn.tailwindcss.com"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.2/axios.min.js"></script></head><body class="bg-[#050505] text-gray-400 h-screen flex items-center justify-center font-sans"><div class="w-full max-w-md p-8 border border-gray-800 rounded-2xl bg-black/50"><h2 class="text-3xl text-white font-serif italic mb-8 text-center">Sign Up</h2><form id="signupForm" class="space-y-6"><input type="text" id="username" placeholder="Username" class="w-full bg-black border border-gray-700 p-3 rounded text-white focus:border-white outline-none"><input type="password" id="password" placeholder="Password" class="w-full bg-black border border-gray-700 p-3 rounded text-white focus:border-white outline-none"><button type="submit" class="w-full bg-white text-black py-3 rounded font-bold uppercase tracking-widest hover:bg-gray-200">Create Account</button></form><p class="mt-4 text-center text-xs">Has account? <a href="login.html" class="text-white underline">Login</a></p></div><script>document.getElementById('signupForm').addEventListener('submit',async(e)=>{e.preventDefault();try{await axios.post('/api/auth/register',{username:document.getElementById('username').value,password:document.getElementById('password').value});alert('Account created. Please login.');window.location.href='login.html';}catch(err){alert(err.response?.data?.error||'Error');}});</script></body></html>`,

    'server.js': `require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static('src'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));
mongoose.connect(process.env.MONGO_URI).then(() => console.log("Connected to MongoDB")).catch(err => console.error(err));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on http://localhost:'+PORT));`
};

// 3. WRITE FILES
Object.entries(files).forEach(([filePath, content]) => {
    fs.writeFileSync(filePath, content);
    console.log('Created: ' + filePath);
});

console.log('✅ PROJECT SETUP COMPLETE');