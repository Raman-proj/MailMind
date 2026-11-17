const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes for logging in
router.get('/google', authController.googleRedirect);
router.get('/google/callback', authController.googleCallback);

// Protected routes (require user to be logged in)
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);

module.exports = router;
