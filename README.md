# VoteSchool 🗳️

> **Know your vote. Own your democracy.**

Civic education web app that teaches Indian voters about the full election process. Built for **PromptWars Virtual** — Topic: Election Process Education.

---

## Problem Statement

India has 970M+ eligible voters, yet many first-time voters aged 18–25 lack basic knowledge about the election process — from registration to counting. VoteSchool bridges this gap with an interactive, accessible, bilingual (English/Hindi) web app that covers voter registration, EVMs, polling day procedures, voter rights, and more.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + React Router v6 + Vite + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Database | Firebase Firestore |
| Auth | Firebase Authentication (Google Sign-In) |
| AI | Gemini API (`gemini-2.0-flash`) |
| Translation | Google Cloud Translation API v2 |
| Analytics | Google Analytics 4 (gtag.js) |
| Fonts | Google Fonts (Noto Sans + Noto Sans Devanagari) |
| Deploy | Docker → Google Cloud Run |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (React)                       │
│  ┌─────────┬──────────┬──────────┬─────────┬──────────┐ │
│  │  Home   │ How It   │   EVM    │Glossary │  Quiz    │ │
│  │         │  Works   │Explainer │         │          │ │
│  ├─────────┼──────────┼──────────┼─────────┼──────────┤ │
│  │Checklist│  Rights  │ Ask AI   │ Navbar  │  Footer  │ │
│  └─────────┴──────────┴──────────┴─────────┴──────────┘ │
│              Google Analytics 4 · Google Fonts           │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP
┌────────────────────────▼────────────────────────────────┐
│                  Server (Express)                        │
│  ┌──────────┐ ┌───────────┐ ┌─────────┐                │
│  │ /api/chat│ │/api/trans- │ │/api/    │                │
│  │          │ │  late      │ │ health  │                │
│  └────┬─────┘ └─────┬─────┘ └─────────┘                │
│       │             │                                    │
│  ┌────▼─────┐ ┌─────▼──────┐                           │
│  │ Gemini   │ │  Cloud     │                            │
│  │  API     │ │ Translation│                            │
│  └────┬─────┘ └────────────┘                            │
│       │                                                  │
│  ┌────▼──────────────┐                                  │
│  │ Firebase Firestore│ (ai_cache + scores)              │
│  └───────────────────┘                                  │
│  Middleware: helmet · cors · rate-limit · sanitize-html  │
└─────────────────────────────────────────────────────────┘
```

---

## Setup Instructions

### Prerequisites
- Node.js 20+
- npm 9+

### Install & Run

```bash
# Clone the repo
git clone https://github.com/your-username/voteschool.git
cd voteschool

# Install dependencies
npm install
cd client && npm install && cd ..

# Copy environment variables
cp .env.example .env
# Fill in your API keys in .env

# Run in development mode
npm run dev
```

The server runs on `http://localhost:8080` and the client dev server on `http://localhost:5173`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio — Gemini API key |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key |
| `GOOGLE_TRANSLATE_API_KEY` | Google Cloud Translation API key |
| `GA_MEASUREMENT_ID` | Google Analytics 4 measurement ID |
| `PORT` | Server port (default: 8080) |

---

## API Documentation

### `GET /api/health`
Returns server status.
```json
{ "status": "ok", "version": "1.0.0", "timestamp": 1714000000000 }
```

### `POST /api/chat`
Send a question to VoteSchool AI.
- **Rate limit**: 20 req/IP/hour
- **Body**: `{ "message": "How do I register to vote?" }`
- **Response**: `{ "response": "To register as a voter..." }`

### `POST /api/translate`
Translate text between English and Hindi.
- **Rate limit**: 100 req/IP/day
- **Body**: `{ "texts": ["Hello"], "targetLang": "hi" }`
- **Response**: `{ "translations": ["नमस्ते"] }`

---

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npx jest --coverage
```

**Test files:**
- `tests/quiz.test.ts` — Score calculation and grade assignment
- `tests/sanitize.test.ts` — XSS protection and input validation
- `tests/translate.test.ts` — Translation API integration
- `tests/chat.test.ts` — AI chat with caching logic

---

## Deployment to Cloud Run

```bash
# Build Docker image
docker build -t voteschool .

# Test locally
docker run -p 8080:8080 --env-file .env voteschool

# Deploy to Cloud Run
gcloud run deploy voteschool \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=...,FIREBASE_PROJECT_ID=..."
```

---

## Google Services Used

1. **Firebase Firestore** — AI response caching + quiz score storage
2. **Firebase Authentication** — Google Sign-In for quiz score saving
3. **Gemini API** (`gemini-2.0-flash`) — AI chat assistant
4. **Google Cloud Translation API** — English ↔ Hindi translation
5. **Google Analytics 4** — 7 custom event types tracked
6. **Google Fonts** — Noto Sans + Noto Sans Devanagari
7. **Google Cloud Run** — Container deployment

---

## License

MIT
