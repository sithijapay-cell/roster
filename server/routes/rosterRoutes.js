const express = require('express');
const router = express.Router();
const rosterController = require('../controllers/rosterController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // Protect all routes

router.get('/profile', rosterController.getProfile);
router.put('/profile', rosterController.updateProfile);
router.get('/shifts', rosterController.getShifts);
router.post('/shift', rosterController.updateShift);
router.delete('/shift/:date', rosterController.deleteShift);
router.post('/calculate-ot', rosterController.calculateOT);

module.exports = router;
