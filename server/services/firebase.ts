/**
 * @fileoverview Firebase Admin SDK initialization.
 * Provides Firestore database instance for server-side operations.
 * Collections: 'ai_cache' (Gemini response cache), 'scores' (quiz scores).
 */

import admin from 'firebase-admin';

let db: FirebaseFirestore.Firestore | null = null;
let firebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK with service account credentials from env vars.
 * Fails gracefully if credentials are missing (for local dev without Firebase).
 */
function initializeFirebase(): void {
  if (firebaseInitialized) return;

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      db = admin.firestore();
      firebaseInitialized = true;
      console.log('✅ Firebase Admin SDK initialized');
    } else {
      console.warn('⚠️  Firebase credentials not found. Firestore features disabled.');
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Firebase initialization error:', errMsg);
  }
}

/**
 * Get the Firestore database instance.
 * @returns Firestore instance or null if not initialized.
 */
export function getDb(): FirebaseFirestore.Firestore | null {
  if (!firebaseInitialized) initializeFirebase();
  return db;
}

// Initialize on module load
initializeFirebase();
