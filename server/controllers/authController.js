const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Register User
exports.register = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert User
        const newUser = await pool.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role',
            [email, passwordHash]
        );

        // Create Nurse Profile (Empty initially)
        await pool.query(
            'INSERT INTO nurses (user_id, name) VALUES ($1, $2)',
            [newUser.rows[0].id, email.split('@')[0]] // Default name from email
        );

        // Create Token
        const token = jwt.sign(
            { id: newUser.rows[0].id, role: newUser.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, user: newUser.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Login User
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const token = jwt.sign(
            { id: user.rows[0].id, role: user.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, user: { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Current User
exports.getMe = async (req, res) => {
    try {
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Google Login
exports.googleLogin = async (req, res) => {
    const { idToken } = req.body;
    const admin = require('../config/firebase');

    try {
        // Verify Token with Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email, sub: googleUid } = decodedToken;

        // Check if user exists
        let user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            // Create New User
            // Note: We set a random password hash or a specific flag since they use Google
            const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);

            const newUser = await pool.query(
                'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
                [email, dummyPassword, 'nurse']
            );

            // Create Nurse Profile
            await pool.query(
                'INSERT INTO nurses (user_id, name) VALUES ($1, $2)',
                [newUser.rows[0].id, email.split('@')[0]]
            );

            user = { rows: [newUser.rows[0]] };
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.rows[0].id, role: user.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, user: user.rows[0] });

    } catch (err) {
        console.error("Google Auth Error:", err);
        res.status(401).json({ message: 'Invalid or expired Google Token' });
    }
};
