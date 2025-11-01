import express from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
  markAsRead,
  deleteConversation,
  getAvailableUsers  
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/users', getAvailableUsers);  

// Conversation routes
router.get('/conversations', getConversations);
router.post('/conversations/start', startConversation);
router.delete('/conversations/:conversationId', deleteConversation);

// Message routes
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/messages/send', sendMessage);
router.post('/conversations/:conversationId/read', markAsRead);

export default router;