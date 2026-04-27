/**
 * @fileoverview Gemini AI service with Firestore response caching.
 * Model: gemini-2.5-flash
 * Caching: SHA-256 hash of user message → Firestore 'ai_cache' collection (TTL 24h).
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import crypto from 'crypto';
import admin from 'firebase-admin';
import { getDb } from './firebase';
import type { FirestoreCacheDoc } from '../types';

/** The system prompt that constrains the AI to civic education topics only. */
export const SYSTEM_PROMPT = `You are VoteSchool, a friendly civic education assistant for Indian voters. Your ONLY purpose is to educate users about India's election process, voter rights, ECI procedures, EVMs, VVPAT, constituency system, and related civics topics. Always be accurate, simple, encouraging, and concise. If asked anything unrelated to Indian elections or civics, politely say: 'I'm only able to answer questions about India's election process. Try asking me about voting, EVMs, or your voter rights!' Always end responses with one follow-up question to keep the user learning.`;

/** Cache time-to-live: 24 hours in milliseconds */
const CACHE_TTL_MS: number = 24 * 60 * 60 * 1000;

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

/**
 * Initialize the Gemini client.
 */
function initializeGemini(): void {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });
    console.log('✅ Gemini API initialized (gemini-2.5-flash)');
  } else {
    console.warn('⚠️  GEMINI_API_KEY not found. AI chat disabled.');
  }
}

/**
 * Hash a message string using SHA-256.
 * @param message - The user message to hash.
 * @returns The hex-encoded hash.
 */
export function hashMessage(message: string): string {
  return crypto.createHash('sha256').update(message.toLowerCase().trim()).digest('hex');
}

/**
 * Check the Firestore cache for a previously generated response.
 * @param hash - The message hash to look up.
 * @returns Cached response or null if miss/expired.
 */
async function checkCache(hash: string): Promise<string | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const doc = await db.collection('ai_cache').doc(hash).get();
    if (!doc.exists) return null;

    const data = doc.data() as FirestoreCacheDoc | undefined;
    if (!data) return null;

    const age = Date.now() - data.createdAt.toMillis();
    if (age < CACHE_TTL_MS) {
      return data.response;
    }
    return null;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Cache read error:', errMsg);
    return null;
  }
}

/**
 * Store a response in the Firestore cache.
 * @param hash - The message hash (used as document ID).
 * @param response - The Gemini response to cache.
 */
async function storeCache(hash: string, response: string): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    await db.collection('ai_cache').doc(hash).set({
      hash,
      response,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Cache write error:', errMsg);
  }
}

/**
 * Generate a response to a user's civic education question.
 * Checks Firestore cache first; calls Gemini API on cache miss.
 * @param userMessage - The user's question (max 500 chars, sanitized).
 * @returns The AI-generated response.
 * @throws If Gemini API is unavailable or fails.
 */
export async function generateResponse(userMessage: string): Promise<string> {
  if (!model) {
    throw new Error('AI service is not configured. Please set GEMINI_API_KEY.');
  }

  const hash = hashMessage(userMessage);

  // Check cache first
  const cachedResponse = await checkCache(hash);
  if (cachedResponse) {
    console.log('Cache hit for message hash:', hash.substring(0, 8));
    return cachedResponse;
  }

  // Call Gemini API
  try {
    const result = await model.generateContent(userMessage);
    const response = result.response.text();

    // Store in cache (fire-and-forget)
    storeCache(hash, response).catch(() => {});

    return response;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Gemini API error:', errMsg);
    throw new Error('Service unavailable');
  }
}

// Initialize on module load
initializeGemini();
