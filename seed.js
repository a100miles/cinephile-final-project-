const mongoose = require('mongoose');
const Movie = require('./models/Movie'); // <--- CRITICAL FIX WAS HERE
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log("Connected to DB. Seeding...");
    
    // Optional: Clear DB first
    await Movie.deleteMany({});

    await Movie.create({
        title: 'The Dark Knight',
        year: '2008',
        director: 'Christopher Nolan',
        posterUrl: 'https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        trailerId: 'EXeTwQWrcwY',
        ratings: { imdb: '9.0', rt: '94%' },
        soundtrack: [{ title: "Why So Serious?", duration: "9:14" }],
        gallery: ['https://image.tmdb.org/t/p/w500/1hRoyzDtpgMU7Dz4JF22RAN49O.jpg']
    });
    
    console.log('Movie added to Database!');
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});