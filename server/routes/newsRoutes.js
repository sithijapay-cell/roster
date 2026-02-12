const express = require('express');
const router = express.Router();
const { getNews } = require('../controllers/newsController');

// @route   GET /api/news
// @desc    Get news feeds by category
// @access  Public
router.get('/', getNews);

module.exports = router;
