/**
 * @fileoverview Translation API route — POST /api/translate
 * Accepts an array of text strings and target language, returns translations.
 */

import { Router, Request, Response } from 'express';
import { translateLimiter } from '../middleware/rateLimiter';
import { translateTexts, VALID_LANGS } from '../services/translate';
import type { TranslateRequest, TranslateResponse } from '../types';

const router = Router();

/**
 * POST /api/translate
 * @body texts - Array of strings to translate
 * @body targetLang - Target language code ('hi' | 'en')
 * @returns Array of translated strings
 */
router.post('/translate', translateLimiter, async (req: Request<unknown, TranslateResponse, TranslateRequest>, res: Response<TranslateResponse>) => {
  try {
    const { texts, targetLang } = req.body;

    // Validate texts
    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: 'texts must be a non-empty array.' });
    }

    // Validate targetLang
    if (!(VALID_LANGS as readonly string[]).includes(targetLang)) {
      return res.status(400).json({ error: "targetLang must be 'hi' or 'en'." });
    }

    const translations = await translateTexts(texts, targetLang);
    return res.json({ translations });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Translate route error:', errMsg);
    return res.status(503).json({ error: 'Translation service unavailable' });
  }
});

export default router;
