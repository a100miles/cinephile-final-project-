const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
    const raw = req.header('Authorization');
    if (!raw) return res.status(401).json({ error: 'Access Denied' });

    const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // { id: ... }
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid Token' });
    }
};
