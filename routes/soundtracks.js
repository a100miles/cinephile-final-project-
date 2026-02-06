const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
    const title = (req.query.title || '').trim();
    const year = (req.query.year || '').trim();
    const limit = Math.min(Number(req.query.limit || 10), 20);

    if (!title) return res.status(400).json({ error: 'title is required' });

    // Query strategy: "<title> soundtrack" (year helps relevance, optional)
    const term = year ? `${title} soundtrack ${year}` : `${title} soundtrack`;

    try {
        const response = await axios.get('https://itunes.apple.com/search', {
            params: {
                term,
                media: 'music',
                entity: 'song',
                limit
            },
            timeout: 12000
        });

        const results = (response.data.results || [])
            .filter(r => r.previewUrl) // only playable
            .map(r => ({
                trackName: r.trackName,
                artistName: r.artistName,
                collectionName: r.collectionName,
                artworkUrl100: r.artworkUrl100,
                previewUrl: r.previewUrl,
                trackTimeMillis: r.trackTimeMillis
            }));

        res.json(results);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to fetch soundtracks' });
    }
});

module.exports = router;
