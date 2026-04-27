/**
 * @fileoverview Input sanitization middleware for Express.
 * Strips HTML tags from all string values in request body,
 * enforces max length, and trims whitespace.
 */

import sanitizeHtml from 'sanitize-html';
import { Request, Response, NextFunction } from 'express';

/** Maximum allowed length for any string input */
export const MAX_STRING_LENGTH = 500;

/**
 * Sanitize a single string value — strip HTML, trim, enforce max length.
 * @param str - The input string to sanitize.
 * @returns The sanitized string.
 */
export function sanitizeString(str: unknown): unknown {
  if (typeof str !== 'string') return str;
  let cleaned = sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} });
  cleaned = cleaned.trim();
  if (cleaned.length > MAX_STRING_LENGTH) {
    cleaned = cleaned.substring(0, MAX_STRING_LENGTH);
  }
  return cleaned;
}

/**
 * Recursively sanitize all string values in an object or array.
 * @param obj - The value to sanitize.
 * @returns The sanitized value.
 */
export function sanitizeDeep(obj: unknown): unknown {
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeDeep);
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      result[key] = sanitizeDeep((obj as Record<string, unknown>)[key]);
    }
    return result;
  }
  return obj;
}

/**
 * Express middleware that sanitizes all string fields in req.body.
 */
export function sanitizeMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeDeep(req.body);
  }
  next();
}
