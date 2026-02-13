const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['https://designink-roster.web.app', 'http://localhost:5173', 'http://localhost:5000'],
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

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
