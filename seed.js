require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB. Seeding...');

    await Movie.deleteMany({});

    await Movie.create([
        {
            title: 'The Dark Knight',
            year: '2008',
            director: 'Christopher Nolan',
            overview: 'Batman faces the Joker, a criminal mastermind who plunges Gotham into chaos.',
            actors: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'],
            posterUrl: 'https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
            trailerId: 'EXeTwQWrcwY',
            tmdbRating: 9.0,
            ratings: { imdb: '9.0', rt: '94%' },
            soundtrack: [
                { title: 'Why So Serious?', duration: '9:14', ytId: 't5qQk0aD3Y8' },
                { title: 'Like a Dog Chasing Cars', duration: '5:10', ytId: 'cU2bKfL1x1c' }
            ],
            gallery: [
                'https://image.tmdb.org/t/p/original/1hRoyzDtpgMU7Dz4JF22RAN49O.jpg',
                'https://image.tmdb.org/t/p/original/hqkIcbrOHL86UncnHIsHVcVmzue.jpg'
            ]
        }
    ]);

    console.log('Seed complete.');
    await mongoose.disconnect();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
