# VoteSchool — Agent Instructions

## Project
VoteSchool is a civic education web app that teaches Indian voters about
the election process. Built for PromptWars Virtual hackathon.
Topic: Election Process Education.

## Stack
- Frontend: React (with React Router)
- Backend: Node.js + Express
- Database: Firebase Firestore
- Auth: Firebase Authentication (Google Sign-In)
- AI: Gemini API (gemini-2.0-flash)
- Translation: Google Cloud Translation API
- Analytics: Google Analytics 4 (GA4)
- Fonts: Google Fonts — Noto Sans + Noto Sans Devanagari
- Deployment: Docker + Google Cloud Run

## Agent Rules
1. NEVER hardcode API keys — always use process.env variables
2. Always add ARIA labels to every interactive element
3. Every component must be keyboard navigable (Tab + Enter/Space)
4. All images must have descriptive alt text
5. Sanitize ALL user input before sending to any external API
6. Add JSDoc comments to every exported function
7. Mobile-first responsive design — base breakpoint: 375px
8. Use Google services for every external service needed
9. Add Content-Security-Policy headers via helmet.js in Express
10. Every new feature must have at least one unit test in /tests

## Folder Structure
voteschool/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── utils/
│       └── data/
│           ├── glossary.json
│           └── quiz.json
├── server/
│   ├── routes/
│   ├── middleware/
│   └── services/
├── tests/
├── .env.example
├── AGENTS.md
├── README.md
└── Dockerfile

## Required Environment Variables
GEMINI_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
GOOGLE_TRANSLATE_API_KEY=
GA_MEASUREMENT_ID=
PORT=8080
