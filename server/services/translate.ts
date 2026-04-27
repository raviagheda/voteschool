/**
 * @fileoverview Google Cloud Translation API v2 service wrapper.
 * Translates text between English and Hindi for bilingual support.
 */

import fetch from 'node-fetch';
import type { TargetLanguage, TranslationAPIResponse, TranslationAPIError } from '../types';

const TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

/** Valid target languages for this app */
export const VALID_LANGS: readonly TargetLanguage[] = ['hi', 'en'] as const;

/**
 * Translate an array of text strings to the target language.
 * Uses Google Cloud Translation API v2 via REST endpoint.
 * @param texts - Array of strings to translate.
 * @param targetLang - Target language code.
 * @returns Array of translated strings.
 * @throws If API key is missing, targetLang is invalid, or API call fails.
 */
export async function translateTexts(texts: string[], targetLang: string): Promise<string[]> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    throw new Error('Translation service is not configured. Please set GOOGLE_TRANSLATE_API_KEY.');
  }

  if (!(VALID_LANGS as readonly string[]).includes(targetLang)) {
    throw new Error(`Invalid target language: ${targetLang}. Must be 'hi' or 'en'.`);
  }

  if (!Array.isArray(texts) || texts.length === 0) {
    throw new Error('texts must be a non-empty array of strings.');
  }

  try {
    const response = await fetch(`${TRANSLATE_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: texts,
        target: targetLang,
        format: 'text',
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as TranslationAPIError;
      throw new Error(errorData.error?.message || 'Translation API error');
    }

    const data = (await response.json()) as TranslationAPIResponse;
    return data.data.translations.map((t) => t.translatedText);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes('Translation service is not configured')) throw error as Error;
    console.error('Translation API error:', errMsg);
    throw new Error('Translation service unavailable');
  }
}
