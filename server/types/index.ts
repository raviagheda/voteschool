/**
 * @fileoverview Shared TypeScript interfaces for VoteSchool server.
 */

/** A single glossary term with definition. */
export interface GlossaryTerm {
  term: string;
  definition: string;
}

/** A single quiz question with multiple-choice options. */
export interface QuizQuestion {
  id: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/** Request body for POST /api/chat */
export interface ChatRequest {
  message: string;
}

/** Response body for POST /api/chat */
export interface ChatResponse {
  response?: string;
  error?: string;
}

/** Request body for POST /api/translate */
export interface TranslateRequest {
  texts: string[];
  targetLang: TargetLanguage;
}

/** Response body for POST /api/translate */
export interface TranslateResponse {
  translations?: string[];
  error?: string;
}

/** Valid target language codes */
export type TargetLanguage = 'hi' | 'en';

/** Health check response */
export interface HealthResponse {
  status: string;
  version: string;
  timestamp: number;
}

/** Firestore cached AI response document */
export interface FirestoreCacheDoc {
  hash: string;
  response: string;
  createdAt: FirebaseFirestore.Timestamp;
}

/** Firestore quiz score document */
export interface FirestoreScoreDoc {
  score: number;
  total: number;
  grade: string;
  timestamp: string;
  userId: string;
}

/** Google Translation API response structure */
export interface TranslationAPIResponse {
  data: {
    translations: Array<{ translatedText: string }>;
  };
}

/** Google Translation API error response */
export interface TranslationAPIError {
  error?: {
    message?: string;
  };
}
