/**
 * @fileoverview How It Works page — vertical timeline with 6 election process steps.
 */

import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { auth } from '../utils/firebase';
import { useState } from 'react';
import toast from 'react-hot-toast';
import './HowItWorks.css';

/** Timeline step data shape */
interface StepData {
  num: number;
  icon: string;
  title: string;
  desc: string;
  link?: { url: string; label: string };
}

const STEPS: StepData[] = [
  {
    num: 1, icon: '📝', title: 'Voter Registration',
    desc: 'Register on voters.eci.gov.in using Form 6. You need proof of age and address. Registration closes before each election cycle.',
    link: { url: 'https://voters.eci.gov.in', label: 'Visit voters.eci.gov.in' },
  },
  { num: 2, icon: '🪪', title: 'Voter ID (EPIC Card)', desc: 'Your EPIC card is your official voter identity card. Download a digital copy from the Voter Helpline app. Keep it safe — you\'ll need it on polling day.' },
  { num: 3, icon: '📍', title: 'Finding Your Polling Booth', desc: 'Your assigned booth is printed on your voter slip. You can also find it on the ECI portal or the Voter Helpline app. Check it 2–3 days before polling day.' },
  { num: 4, icon: '🌅', title: 'Polling Day Morning', desc: 'Arrive at your booth within polling hours (typically 7AM–6PM). Bring your EPIC card or any approved alternate photo ID. You\'ll queue and get a token from the Presiding Officer.' },
  { num: 5, icon: '🗳️', title: 'Casting Your Vote', desc: 'You\'ll press the blue button next to your candidate on the EVM. The VVPAT machine will show a paper slip confirming your choice for 7 seconds. This slip drops into a sealed box — not visible to anyone else.' },
  { num: 6, icon: '📊', title: 'Counting & Results', desc: 'Votes are counted on a separate Counting Day, usually 1–2 weeks after polling. Results are declared constituency by constituency. The candidate with the most votes (first-past-the-post) wins.' },
];

/**
 * How It Works page with animated vertical timeline.
 */
export default function HowItWorks(): React.JSX.Element {
  const { translate } = useLanguage();
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveNotes = async () => {
    if (!auth?.currentUser) {
      toast.error('Please sign in to save study notes to your Notebook.');
      return;
    }

    setSaving(true);
    try {
      const notesContent = STEPS.map(s => `${s.num}. ${s.title}\n${s.desc}`).join('\n\n');
      
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          type: 'study',
          title: 'How Indian Elections Work - Study Guide',
          content: notesContent,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to save');

      setSaved(true);
      toast.success('Study notes saved to Notebook!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving study notes:', err);
      toast.error('Failed to save study notes. Try again later.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('step--visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    stepsRef.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="how-it-works section">
      <div className="container">
        <div className="section-title">
          <h1>{translate('hiw_title', 'How Indian Elections Work')}</h1>
          <p>{translate('hiw_sub', 'Your journey from registration to results — in 6 simple steps.')}</p>
        </div>

        <div className="timeline" role="list" aria-label="Election process steps">
          {STEPS.map((step, i) => (
            <div key={step.num} className="timeline-step" ref={(el) => { stepsRef.current[i] = el; }} role="listitem">
              <div className="step-marker">
                <span className="step-number" aria-hidden="true">{step.num}</span>
              </div>
              <div className="step-content card">
                <span className="step-icon" aria-hidden="true">{step.icon}</span>
                <h2 className="step-title">{translate(`step_${step.num}`, step.title)}</h2>
                <p className="step-desc">{translate(`step_desc_${step.num}`, step.desc)}</p>
                {step.link && (
                  <a href={step.link.url} target="_blank" rel="noopener noreferrer" className="step-link" aria-label={step.link.label}>
                    {step.link.label} ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleSaveNotes} 
            disabled={saving || saved}
            aria-label="Save Study Guide to Notebook"
          >
            {saved ? '✓ Saved to Notebook' : saving ? 'Saving...' : '📚 Save Study Guide to Notebook'}
          </button>
        </div>
      </div>
    </div>
  );
}
