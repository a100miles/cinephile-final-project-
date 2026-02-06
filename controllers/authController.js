const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');

const registerSchema = Joi.object({
    username: Joi.string().min(3).max(24).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(72).required(),
    confirmPassword: Joi.string().min(6).max(72).required()
});

const loginSchema = Joi.object({
    identifier: Joi.string().min(3).max(120).required(), // username OR email
    password: Joi.string().min(6).max(72).required()
});

async function register(req, res) {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: true, stripUnknown: true });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { username, email, password, confirmPassword } = value;

    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) return res.status(409).json({ error: 'Username or email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword });

    res.status(201).json({ message: 'User created' });
}

async function login(req, res) {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: true, stripUnknown: true });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { identifier, password } = value;
    const ident = identifier.trim().toLowerCase();

    const user = await User.findOne({
        $or: [{ username: identifier }, { email: ident }]
    });

    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, username: user.username, email: user.email });
}

module.exports = { register, login };
