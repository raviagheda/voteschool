/**
 * @fileoverview Chat API route — POST /api/chat
 * Accepts a user message, validates it, checks cache, calls Gemini, returns response.
 */

import { Router, Request, Response } from 'express';
import { chatLimiter } from '../middleware/rateLimiter';
import { generateResponse } from '../services/gemini';
import type { ChatRequest, ChatResponse } from '../types';

const router = Router();

/**
 * POST /api/chat
 * @body message - User's question (required, max 500 chars)
 * @returns AI-generated response
 */
router.post('/chat', chatLimiter, async (req: Request<unknown, ChatResponse, ChatRequest>, res: Response<ChatResponse>) => {
  try {
    const { message } = req.body;

    // Validate message
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (message.length > 500) {
      return res.status(400).json({ error: 'Message must be 500 characters or fewer.' });
    }

    const response = await generateResponse(message);
    return res.json({ response });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Chat route error:', errMsg);
    return res.status(503).json({ error: 'Service unavailable' });
  }
});

export default router;
