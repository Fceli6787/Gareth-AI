import express from 'express';
import { chatController } from '../controllers/chatController.js';

const router = express.Router();

// Chat endpoints
router.post('/chat', chatController.sendMessage);
router.post('/chat/stream', chatController.streamMessage);

// Models endpoint
router.get('/models', chatController.getModels);

// Health check
router.get('/health', chatController.healthCheck);

export default router;
