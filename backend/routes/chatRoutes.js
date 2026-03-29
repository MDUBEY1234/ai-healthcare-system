// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory, getConversationMessages } = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/authenticateToken');

router.use(authenticateToken);

router.post('/message', sendMessage);
router.get('/history', getChatHistory);
router.get('/:id/messages', getConversationMessages);

module.exports = router;