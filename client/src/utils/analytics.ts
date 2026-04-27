/**
 * @fileoverview Google Analytics 4 custom event tracking utilities.
 * All 7 custom events as named exports for use across components.
 */

/**
 * Generic event tracker — wraps gtag('event', ...).
 * Gracefully does nothing if GA4 is not initialized.
 * @param eventName - GA4 event name.
 * @param params - Event parameters.
 */
export function trackEvent(eventName: string, params: Record<string, unknown> = {}): void {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

/** Track quiz started event. */
export function trackQuizStarted(): void {
  trackEvent('quiz_started');
}

/** Track quiz completed event with score and grade. */
export function trackQuizCompleted(score: number, grade: string): void {
  trackEvent('quiz_completed', { score, grade });
}

/** Track AI chat message sent event. */
export function trackAiChatSent(): void {
  trackEvent('ai_chat_sent');
}

/** Track language toggle event. */
export function trackLanguageToggled(targetLang: string): void {
  trackEvent('language_toggled', { target_lang: targetLang });
}

/** Track checklist item checked event. */
export function trackChecklistChecked(item: string): void {
  trackEvent('checklist_item_checked', { item });
}

/** Track glossary search event. */
export function trackGlossarySearched(query: string): void {
  trackEvent('glossary_searched', { query });
}

/** Track EVM FAQ opened event. */
export function trackEvmFaqOpened(questionIndex: number): void {
  trackEvent('evm_faq_opened', { question_index: questionIndex });
}
