/**
 * @fileoverview Polling Day Checklist — interactive checkbox list with progress bar.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { trackChecklistChecked } from '../utils/analytics';
import './Checklist.css';

const ITEMS: string[] = [
  'Check your polling booth address the day before',
  'Carry your EPIC card (Voter ID) or approved alternate ID',
  'Note polling hours for your state (usually 7AM–6PM)',
  'Do not bring campaign material within 100 metres of the booth',
  'Queue calmly — you will receive a numbered token',
  'Verify your name on the electoral roll with the officer',
  'Press ONLY the blue button next to your candidate on the EVM',
  'Watch the VVPAT screen for 7 seconds to verify your vote',
  'Do NOT take photos inside the polling booth',
  'Check your left index finger for the indelible ink mark',
];

/** Polling Day Checklist page. */
export default function Checklist(): React.JSX.Element {
  const { translate } = useLanguage();
  const [checked, setChecked] = useState<boolean[]>(() => {
    const saved = localStorage.getItem('voteschool_checklist');
    return saved ? (JSON.parse(saved) as boolean[]) : new Array(ITEMS.length).fill(false) as boolean[];
  });

  useEffect(() => {
    localStorage.setItem('voteschool_checklist', JSON.stringify(checked));
  }, [checked]);

  const completedCount: number = checked.filter(Boolean).length;
  const progress: number = Math.round((completedCount / ITEMS.length) * 100);

  const handleToggle = useCallback((index: number): void => {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      if (next[index]) trackChecklistChecked(ITEMS[index]);
      return next;
    });
  }, []);

  const handlePrint = useCallback((): void => { window.print(); }, []);

  const handleShare = useCallback((): void => {
    const text = ITEMS.map((item, i) =>
      `${checked[i] ? '✅' : '☐'} ${item}`
    ).join('\n');
    const msg = `🗳️ VoteSchool Polling Day Checklist:\n\n${text}\n\nCheck yours at voteschool.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  }, [checked]);

  return (
    <div className="checklist-page section">
      <div className="container">
        <div className="section-title">
          <h1>{translate('cl_title', 'Polling Day Checklist')}</h1>
          <p>{translate('cl_sub', 'Be fully prepared. Check off each item before you head to vote.')}</p>
        </div>

        <div className="progress-wrapper" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Checklist ${progress}% complete`}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-text">{progress}% complete ({completedCount}/{ITEMS.length})</span>
        </div>

        <div className="checklist-items" role="list" aria-label="Polling day checklist items">
          {ITEMS.map((item, i) => (
            <label key={i} className={`checklist-item ${checked[i] ? 'checklist-item--done' : ''}`} role="listitem">
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => handleToggle(i)}
                aria-label={item}
                className="checklist-checkbox"
              />
              <span className="checklist-checkmark" aria-hidden="true">{checked[i] ? '✓' : ''}</span>
              <span className="checklist-text">{translate(`cl_${i}`, item)}</span>
            </label>
          ))}
        </div>

        <div className="checklist-actions">
          <button className="btn btn-outline" onClick={handlePrint} aria-label="Print this checklist" type="button">🖨️ Print Checklist</button>
          <button className="btn btn-accent" onClick={handleShare} aria-label="Share this checklist on WhatsApp" type="button">📲 Share on WhatsApp</button>
        </div>
      </div>
    </div>
  );
}
