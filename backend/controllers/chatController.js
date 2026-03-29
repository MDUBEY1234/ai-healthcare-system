// controllers/chatController.js
const ChatConversation = require('../models/ChatConversation');
const chatService = require('../services/chatService');

// POST /api/chat/message
exports.sendMessage = async (req, res) => {
  const { message, conversationId } = req.body;
  const userId = req.user.id;

  try {
    let conversation;
    // If no conversationId is provided, create a new one.
    if (!conversationId) {
      conversation = await chatService.createConversation(userId, message);
    } else {
      conversation = await ChatConversation.findById(conversationId);
      if (!conversation || conversation.userId.toString() !== userId) {
        return res.status(404).json({ message: 'Conversation not found or access denied.' });
      }
      // Save the user's message
      await chatService.saveMessage(conversation._id, 'user', message);
    }

    // Generate AI response
    const aiContent = await chatService.generateAIResponse(message, userId, conversation);
    // Save AI's message
    const aiMessage = await chatService.saveMessage(conversation._id, 'ai', aiContent);

    res.status(200).json({
      success: true,
      conversationId: conversation._id,
      aiMessage: aiMessage
    });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ success: false, message: 'Error processing chat message.' });
  }
};

// GET /api/chat/history
exports.getChatHistory = async (req, res) => {
    try {
        const history = await ChatConversation.find({ userId: req.user.id })
            .select('conversationTitle lastActivity _id')
            .sort({ lastActivity: -1 });
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch chat history.' });
    }
};

// GET /api/chat/:id/messages
exports.getConversationMessages = async (req, res) => {
    try {
        const conversation = await ChatConversation.findOne({ _id: req.params.id, userId: req.user.id });
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found.' });
        }
        res.status(200).json({ success: true, data: conversation.messages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
    }
};