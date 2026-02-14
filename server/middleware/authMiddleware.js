const { admin, initialized } = require('../config/firebase');
const { pool } = require('../config/db');

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    if (!initialized) {
        console.error("Firebase Admin not initialized");
        return res.status(500).json({ message: 'Server Authentication Error' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Lookup user in Postgres to get the ID for internal relations
        const userResult = await pool.query('SELECT id, role FROM users WHERE email = $1', [decodedToken.email]);

        if (userResult.rows.length > 0) {
            req.user = {
                ...decodedToken,
                id: userResult.rows[0].id,
                role: userResult.rows[0].role
            };
            next();
        } else {
            // User authenticated with Firebase but not in Postgres yet.
            // This might happen on the very first call to /sync (which is protected).
            // So we MUST allow the request to proceed if it is destined for /sync (or similar).
            // However, /sync needs to run *without* req.user.id being present.
            // The controller for /sync uses req.user.email, so it is fine.
            // For other routes (like /roster/shifts), they rely on req.user.id.

            req.user = decodedToken; // Just the firebase data
            next();
        }

    } catch (err) {
        console.error("Token verification failed:", err.message);
        res.status(401).json({ message: 'Token is not valid', error: err.message });
    }
};

module.exports = authMiddleware;
