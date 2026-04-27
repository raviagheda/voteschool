/**
 * @fileoverview Glossary page with live search and A–Z term list.
 */

import React, { useState, useMemo, useCallback, useRef, ChangeEvent } from 'react';
import glossaryData from '../data/glossary.json';
import { useLanguage } from '../contexts/LanguageContext';
import { trackGlossarySearched } from '../utils/analytics';
import { auth } from '../utils/firebase';
import toast from 'react-hot-toast';
import './Glossary.css';

/** Glossary term shape from JSON */
interface GlossaryTermData {
  term: string;
  definition: string;
}

/** Props for the GlossaryItem component */
interface GlossaryItemProps {
  term: string;
  definition: string;
}

/** Memoized glossary term item. */
const GlossaryItem = React.memo(function GlossaryItem({ term, definition }: GlossaryItemProps): React.JSX.Element {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!auth?.currentUser) {
      toast.error('Please sign in to save glossary terms to your Notebook.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          type: 'glossary',
          title: term,
          content: definition,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) throw new Error('Failed to save');
      
      setSaved(true);
      toast.success(`Saved "${term}" to Notebook!`);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving glossary term:', err);
      toast.error('Failed to save. Try again later.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glossary-item card" role="listitem">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 className="glossary-term">{term}</h3>
        <button 
          onClick={handleSave} 
          disabled={saving || saved}
          className="btn btn-outline" 
          style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }}
          aria-label={`Save ${term} to Notebook`}
        >
          {saved ? '✓ Saved' : saving ? '...' : '🔖 Save'}
        </button>
      </div>
      <p className="glossary-def">{definition}</p>
    </div>
  );
});

/** Glossary page with live search filtering. */
export default function Glossary(): React.JSX.Element {
  const { translate } = useLanguage();
  const [query, setQuery] = useState<string>('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (val.trim()) trackGlossarySearched(val.trim());
    }, 500);
  }, []);

  const filtered = useMemo((): GlossaryTermData[] => {
    if (!query.trim()) return glossaryData as GlossaryTermData[];
    const q = query.toLowerCase();
    return (glossaryData as GlossaryTermData[]).filter(
      (item) =>
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="glossary-page section">
      <div className="container">
        <div className="section-title">
          <h1>{translate('glos_title', 'Election Glossary')}</h1>
          <p>{translate('glos_sub', '20 key terms every Indian voter should know.')}</p>
        </div>

        <div className="glossary-search">
          <label htmlFor="glossary-search-input" className="sr-only">Search glossary terms</label>
          <input
            id="glossary-search-input"
            type="search"
            className="glossary-input"
            placeholder="Search terms..."
            value={query}
            onChange={handleSearch}
            aria-label="Search glossary terms"
            autoComplete="off"
          />
          <span className="glossary-count" aria-live="polite">
            {filtered.length} term{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>

        <div className="glossary-list" role="list" aria-label="Glossary terms">
          {filtered.map((item) => (
            <GlossaryItem key={item.term} term={item.term} definition={item.definition} />
          ))}
          {filtered.length === 0 && (
            <p className="glossary-empty">No terms match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}
