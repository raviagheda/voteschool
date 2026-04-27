/// <reference types="vite/client" />

/** Extend the Window interface with GA4 globals */
interface Window {
  gtag: (...args: [string, ...unknown[]]) => void;
  dataLayer: unknown[];
  GA_MEASUREMENT_ID: string;
}

/** Vite environment variables */
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** CSS module declarations */
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
