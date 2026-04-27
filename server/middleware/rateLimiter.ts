/**
 * @fileoverview Rate limiting middleware for API routes.
 * Uses express-rate-limit with per-route configurations.
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for /api/chat — 20 requests per IP per hour.
 */
export const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many chat requests. Please try again later.' },
});

/**
 * Rate limiter for /api/translate — 100 requests per IP per day.
 */
export const translateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Translation limit reached. Please try again tomorrow.' },
});

/**
 * Default rate limiter — 200 requests per IP per hour.
 */
export const defaultLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});
