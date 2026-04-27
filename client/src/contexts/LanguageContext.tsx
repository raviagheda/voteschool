/**
 * @fileoverview Language context for bilingual support (EN/HI).
 * Manages language state, translation API calls, and localStorage caching.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { trackLanguageToggled } from '../utils/analytics';

/** Shape of the language context value. */
interface LanguageContextValue {
  language: string;
  toggleLanguage: () => void;
  translate: (key: string, text: string) => string;
  batchTranslate: (textMap: Record<string, string>) => Promise<void>;
}

/** Props for the LanguageProvider component. */
interface LanguageProviderProps {
  children: ReactNode;
}

/** Translation API response shape. */
interface TranslateAPIResponse {
  translations: string[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Translate an array of texts by calling the backend translation API.
 */
async function callTranslateAPI(texts: string[], targetLang: string): Promise<string[]> {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, targetLang }),
    });

    if (!response.ok) throw new Error('Translation failed');
    const data = (await response.json()) as TranslateAPIResponse;
    return data.translations;
  } catch (error) {
    console.error('Translation error:', error);
    return texts; // Return original texts as fallback
  }
}

/**
 * Language context provider component.
 * Wraps the app to provide language state and translation utilities.
 */
export function LanguageProvider({ children }: LanguageProviderProps): React.JSX.Element {
  const [language, setLanguage] = useState<string>(
    () => localStorage.getItem('voteschool_lang') || 'en'
  );
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const pendingTranslations = useRef<Record<string, string>>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleLanguage = useCallback((): void => {
    setLanguage((prev) => {
      const newLang = prev === 'en' ? 'hi' : 'en';
      localStorage.setItem('voteschool_lang', newLang);
      trackLanguageToggled(newLang);
      return newLang;
    });
  }, []);

  const batchTranslate = useCallback(
    async (textMap: Record<string, string>): Promise<void> => {
      if (language === 'en') return;

      const keys = Object.keys(textMap);
      const texts = Object.values(textMap);

      const uncachedKeys: string[] = [];
      const uncachedTexts: string[] = [];
      keys.forEach((key, i) => {
        const cacheKey = `hi_${key}`;
        if (!localStorage.getItem(cacheKey)) {
          uncachedKeys.push(key);
          uncachedTexts.push(texts[i]);
        }
      });

      if (uncachedTexts.length === 0) return;

      const translated = await callTranslateAPI(uncachedTexts, 'hi');
      const newTranslations: Record<string, string> = {};

      uncachedKeys.forEach((key, i) => {
        const cacheKey = `hi_${key}`;
        if (translated[i]) {
          localStorage.setItem(cacheKey, translated[i]);
          newTranslations[cacheKey] = translated[i];
        }
      });

      setTranslations((prev) => ({ ...prev, ...newTranslations }));
    },
    [language]
  );

  const translate = useCallback(
    (key: string, text: string): string => {
      if (language === 'en') return text;

      const cacheKey = `hi_${key}`;
      if (translations[cacheKey]) return translations[cacheKey];

      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        // Defers state update to avoid React render warnings
        setTimeout(() => setTranslations((prev) => ({ ...prev, [cacheKey]: stored })), 0);
        return stored;
      }

      // Add to pending queue to be translated
      if (!pendingTranslations.current[key]) {
        pendingTranslations.current[key] = text;
        
        // Debounce the API call
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          const toTranslate = { ...pendingTranslations.current };
          pendingTranslations.current = {}; // clear queue
          batchTranslate(toTranslate);
        }, 150);
      }

      return text; // Return English immediately while loading
    },
    [language, translations, batchTranslate]
  );


  return (
    <LanguageContext.Provider
      value={{ language, toggleLanguage, translate, batchTranslate }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access language context.
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
