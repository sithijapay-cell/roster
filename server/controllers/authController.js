const { pool } = require('../config/db');

// Sync User (Ensure Firebase User exists in Postgres)
exports.syncUser = async (req, res) => {
    const { uid, email, picture } = req.user; // From authMiddleware (Firebase Token)

    try {
        // Check if user exists by firebase_uid (we might need to add this column or map via email)
        // For now, let's assume specific email mapping or we add a column.
        // SINCE WE ARE MIGRATING: Let's use email as the lookup for now, but ideally we should store `firebase_uid`.
        // Let's check if the 'users' table has a firebase_uid column. If not, we might fallback to email.

        // Strategy: Look up by email.
        let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        let userId;

        if (userResult.rows.length === 0) {
            // Create new user in Postgres
            const newUser = await pool.query(
                'INSERT INTO users (email, role) VALUES ($1, $2) RETURNING id',
                [email, 'nurse']
            );
            userId = newUser.rows[0].id;

            // Create Nurse Profile
            await pool.query(
                'INSERT INTO nurses (user_id, name) VALUES ($1, $2)',
                [userId, email.split('@')[0]]
            );
        } else {
            userId = userResult.rows[0].id;
        }

        // Return the user profile data
        const profileResult = await pool.query(`
            SELECT u.id, u.email, u.role, n.name, n.designation, n.institution, n.ward 
            FROM users u
            LEFT JOIN nurses n ON u.id = n.user_id
            WHERE u.id = $1
        `, [userId]);

        res.json(profileResult.rows[0]);

    } catch (err) {
        console.error("Sync User Error:", err.message);
        res.status(500).send('Server Error');
    }
};

// Get Current User Profile
exports.getMe = async (req, res) => {
    try {
        // req.user is the decoded Firebase token
        const { email } = req.user;

        const userResult = await pool.query(`
            SELECT u.id, u.email, u.role, n.name, n.designation, n.institution, n.ward 
            FROM users u
            LEFT JOIN nurses n ON u.id = n.user_id
            WHERE u.email = $1
        `, [email]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found in database' });
        }

        res.json(userResult.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.debugFirebase = (req, res) => {
    const { initialized, initError } = require('../config/firebase');
    res.json({
        status: initialized ? 'connected' : 'failed',
        error: initError
    });
};
