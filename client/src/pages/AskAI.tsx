/**
 * @fileoverview Ask VoteSchool AI — full-page chat interface powered by Gemini.
 */

import React, { useState, useCallback, useRef, useEffect, KeyboardEvent, FormEvent } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { trackAiChatSent } from '../utils/analytics';
import { auth } from '../utils/firebase';
import toast from 'react-hot-toast';
import './AskAI.css';

const STARTERS: string[] = [
  'How do I register to vote?',
  'What happens on polling day?',
  'Is my vote really secret?',
];

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

interface ChatAPIResponse {
  response?: string;
  error?: string;
}

/**
 * Ask VoteSchool AI chat page.
 */
export default function AskAI(): React.JSX.Element {
  const { translate } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string): Promise<void> => {
    const userMsg = text.trim();
    if (!userMsg || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);
    trackAiChatSent();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = (await res.json()) as ChatAPIResponse;

      if (data.response) {
        setMessages((prev) => [...prev, { role: 'ai', content: data.response! }]);
      } else {
        setMessages((prev) => [...prev, { role: 'ai', content: data.error || 'Something went wrong. Please try again.' }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', content: 'Unable to connect. Please check your connection and try again.' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [loading]);

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    sendMessage(input).catch(() => {});
  }, [input, sendMessage]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input).catch(() => {});
    }
  }, [input, sendMessage]);

  const handleSaveChat = async () => {
    if (messages.length === 0) return;
    if (!auth?.currentUser) {
      toast.error('Please sign in to save this chat to your Notebook.');
      return;
    }

    setSaving(true);
    try {
      const chatContent = messages.map(m => `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`).join('\n\n');
      
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          type: 'ai_chat',
          title: `AI Chat - ${new Date().toLocaleDateString()}`,
          content: chatContent,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to save');

      setSaved(true);
      toast.success('Chat saved to Notebook!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving chat:', err);
      toast.error('Failed to save chat. Try again later.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <h1 className="chat-title">
            <span aria-hidden="true">💬</span> {translate('chat_title', 'Ask VoteSchool AI')}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {messages.length > 0 && (
              <button 
                onClick={handleSaveChat} 
                disabled={saving || saved}
                className="btn btn-outline"
                style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}
              >
                {saved ? '✓ Saved' : saving ? '...' : '💾 Save Chat'}
              </button>
            )}
            <span className="gemini-badge" aria-label="Powered by Google Gemini">
              Powered by Gemini
            </span>
          </div>
        </div>

        <div className="chat-messages" role="log" aria-label="Chat conversation" aria-live="polite">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <span className="chat-welcome-icon" aria-hidden="true">🗳️</span>
              <h2>{translate('chat_welcome', 'Welcome to VoteSchool AI')}</h2>
              <p>{translate('chat_welcome_sub', 'Ask me anything about India\'s election process!')}</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble chat-bubble--${msg.role}`}>
              <div className="bubble-avatar" aria-hidden="true">
                {msg.role === 'user' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>
                )}
              </div>
              <div className="bubble-content">
                <p>{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-bubble chat-bubble--ai">
              <div className="bubble-avatar" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>
              </div>
              <div className="bubble-content">
                <div className="typing-indicator" aria-label="AI is typing">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-starters" aria-label="Suggested questions">
          {STARTERS.map((s, i) => (
            <button
              key={i}
              className="starter-chip"
              onClick={() => { sendMessage(s).catch(() => {}); }}
              aria-label={`Ask: ${s}`}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>

        <form className="chat-input-form" onSubmit={handleSubmit}>
          <label htmlFor="chat-input" className="sr-only">Type your question</label>
          <div className="chat-input-wrapper">
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="Ask about elections, EVMs, voter rights..."
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 500))}
              onKeyDown={handleKeyDown}
              maxLength={500}
              aria-label="Type your question about Indian elections"
              autoComplete="off"
            />
            <span className="char-count" aria-live="polite">{input.length}/500</span>
            <button
              type="submit"
              className="chat-send"
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
