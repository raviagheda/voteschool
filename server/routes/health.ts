/**
 * @fileoverview Health check API route — GET /api/health
 * Returns server status, version, and timestamp.
 */

import { Router, Request, Response } from 'express';
import type { HealthResponse } from '../types';

const router = Router();

/**
 * GET /api/health
 * @returns Server status, version, and timestamp
 */
router.get('/health', (_req: Request, res: Response<HealthResponse>) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: Date.now(),
  });
});

export default router;
