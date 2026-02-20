const express = require('express');
const router = express.Router();
const { getNews } = require('../controllers/newsController');

// @route   GET /api/news
// @desc    Get news feeds by category
// @access  Public
router.get('/', getNews);

// @route   POST /api/news/refresh
// @desc    Trigger Manual YouTube/WHO Fetch
// @access  Private (Admin) - Protected in frontend by AuthGuard, backend could use middleware
const { refreshContent } = require('../controllers/newsController');
router.post('/refresh', refreshContent);

module.exports = router;
