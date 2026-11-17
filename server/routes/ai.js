const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/analyze/:emailId', aiController.analyzeEmail);
router.post('/generate-reply/:emailId', aiController.generateReply);

module.exports = router;
