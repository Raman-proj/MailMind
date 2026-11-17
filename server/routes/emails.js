const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { protect } = require('../middleware/auth');

// All email routes are protected - you must be logged in to access your emails!
router.use(protect);

router.get('/', emailController.getEmails);
router.get('/:id', emailController.getEmailById);
router.post('/:id/send', emailController.sendReply);

module.exports = router;
