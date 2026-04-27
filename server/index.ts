/**
 * @fileoverview Express server entry point for VoteSchool.
 * Applies security middleware, mounts API routes, and serves the React SPA.
 */

import 'dotenv/config';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { sanitizeMiddleware } from './middleware/sanitize';
import chatRoutes from './routes/chat';
import translateRoutes from './routes/translate';
import healthRoutes from './routes/health';
import notesRoutes from './routes/notes';

const app = express();
const PORT: number = parseInt(process.env.PORT || '8080', 10);

// ---------------------------------------------------------------------------
// 1. Security headers (helmet) — includes CSP, X-Frame-Options, HSTS, etc.
// ---------------------------------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://www.googletagmanager.com',
          'https://www.google-analytics.com',
          'https://apis.google.com',
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://www.google-analytics.com'],
        connectSrc: [
          "'self'",
          'https://www.google-analytics.com',
          'https://firestore.googleapis.com',
          'https://identitytoolkit.googleapis.com',
          'https://securetoken.googleapis.com',
        ],
        frameSrc: ["'self'", 'https://accounts.google.com'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// ---------------------------------------------------------------------------
// 2. CORS — allow only the app's own origin
// ---------------------------------------------------------------------------
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ---------------------------------------------------------------------------
// 3. Parse JSON body
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '10kb' }));

// ---------------------------------------------------------------------------
// 4. Sanitize all string inputs in request body
// ---------------------------------------------------------------------------
app.use(sanitizeMiddleware);

// ---------------------------------------------------------------------------
// 5. API routes
// ---------------------------------------------------------------------------
app.use('/api', healthRoutes);
app.use('/api', chatRoutes);
app.use('/api', translateRoutes);
app.use('/api/notes', notesRoutes);

// ---------------------------------------------------------------------------
// 6. Serve React static build
// ---------------------------------------------------------------------------
const clientDistPath: string = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// ---------------------------------------------------------------------------
// 7. SPA fallback — serve index.html for all non-API routes
// ---------------------------------------------------------------------------
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// ---------------------------------------------------------------------------
// 8. Start server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`VoteSchool server running on port ${PORT}`);
});

export default app;
