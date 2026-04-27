/**
 * @fileoverview Landing page (Home) with hero section, animated stats, and feature cards.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './Home.css';

/** Stat item shape */
interface StatData {
  value: number;
  suffix: string;
  label: string;
}

/** Feature card shape */
interface FeatureData {
  icon: string;
  title: string;
  desc: string;
  to: string;
}

const STATS: StatData[] = [
  { value: 970, suffix: 'M+', label: 'Eligible Voters' },
  { value: 543, suffix: '', label: 'Lok Sabha Seats' },
  { value: 5, suffix: '-Year', label: 'Term Duration' },
];

const FEATURES: FeatureData[] = [
  { icon: '📋', title: 'How It Works', desc: 'Step-by-step election process', to: '/how-it-works' },
  { icon: '🗳️', title: 'EVM Explained', desc: 'Electronic voting machines demystified', to: '/evm' },
  { icon: '📖', title: 'Glossary', desc: '20 key election terms defined', to: '/glossary' },
  { icon: '🧠', title: 'Take the Quiz', desc: 'Test your election knowledge', to: '/quiz' },
];

/**
 * Animated counter hook — counts up from 0 to target on visibility.
 */
function useCountUp(target: number, duration = 2000): [React.RefObject<HTMLDivElement>, number] {
  const [count, setCount] = useState<number>(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef<boolean>(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const step = (timestamp: number): void => {
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return [ref, count];
}

/**
 * Single stat item with animated count-up.
 */
function StatItem({ value, suffix, label }: StatData): React.JSX.Element {
  const [ref, count] = useCountUp(value);

  return (
    <div className="stat-item" ref={ref}>
      <span className="stat-value" aria-label={`${value}${suffix} ${label}`}>
        {count}{suffix}
      </span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/**
 * Landing page component.
 */
export default function Home(): React.JSX.Element {
  const { translate } = useLanguage();

  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-bg" aria-hidden="true" />
        <div className="container hero-content">
          <h1 id="hero-heading" className="hero-headline">
            {translate('hero_headline', 'Know your vote. Own your democracy.')}
          </h1>
          <p className="hero-subheading">
            {translate('hero_sub', "India's election process — simplified for every voter.")}
          </p>
          <div className="hero-ctas">
            <Link to="/how-it-works" className="btn btn-primary" aria-label="Start learning about the election process">
              Start Learning →
            </Link>
            <Link to="/chat" className="btn btn-accent" aria-label="Ask VoteSchool AI a question">
              Ask VoteSchool AI 💬
            </Link>
          </div>
        </div>
      </section>

      <section className="stats-bar" aria-label="Key election statistics">
        <div className="container stats-grid">
          {STATS.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      <section className="features section" aria-labelledby="features-heading">
        <div className="container">
          <div className="section-title">
            <h2 id="features-heading">{translate('features_title', 'Explore VoteSchool')}</h2>
            <p>{translate('features_desc', 'Everything you need to know before your first vote.')}</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <Link key={f.to} to={f.to} className="feature-card card" aria-label={`Go to ${f.title} section`}>
                <span className="feature-icon" aria-hidden="true">{f.icon}</span>
                <h3 className="feature-title">{translate(`feat_${f.to}`, f.title)}</h3>
                <p className="feature-desc">{translate(`feat_desc_${f.to}`, f.desc)}</p>
                <span className="feature-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
