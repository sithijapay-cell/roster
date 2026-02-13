const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const { pool } = require('./config/db');

// Middleware
app.use(cors({
    origin: ['https://designink-roster.web.app', 'https://designink-roster.firebaseapp.com', 'http://localhost:5173', 'http://localhost:5000'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/roster', require('./routes/rosterRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));

app.get('/', (req, res) => {
    res.send('Nurse Roster API is running');
});

app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT NOW()');
        res.json({ status: 'healthy', database: 'connected' });
    } catch (err) {
        console.error('Health check failed', err);
        res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
