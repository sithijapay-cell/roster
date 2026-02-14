const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/sync', authMiddleware, authController.syncUser);
router.get('/me', authMiddleware, authController.getMe);
router.get('/debug', authController.debugFirebase);

module.exports = router;
