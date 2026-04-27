/**
 * @fileoverview Know Your Rights page — 4 voter rights cards in a 2x2 grid.
 */

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './KnowYourRights.css';

interface RightData {
  icon: string;
  title: string;
  desc: string;
  source: string;
}

const RIGHTS: RightData[] = [
  {
    icon: '🏖️',
    title: 'Right to a Paid Holiday',
    desc: 'Under the Representation of the People Act, your employer is legally required to give you a paid holiday on polling day. Refusing this is a punishable offence.',
    source: 'ECI official guidelines',
  },
  {
    icon: '🔒',
    title: 'Your Vote is Secret',
    desc: 'No one — not your employer, family member, or political worker — can compel you to reveal how you voted. The secret ballot is your constitutional right.',
    source: 'Section 128, Representation of the People Act 1951',
  },
  {
    icon: '📞',
    title: 'Report Coercion: Call 1950',
    desc: 'Booth capturing, voter intimidation, or bribery are criminal offences. Call the national Voter Helpline 1950 to report violations immediately and anonymously.',
    source: 'ECI Voter Helpline',
  },
  {
    icon: '♿',
    title: 'Assistance for Disabled Voters',
    desc: 'If you have a disability or are elderly, you are permitted to bring one companion of your choice inside the booth to assist you. Braille EVMs are available at designated booths.',
    source: 'ECI accessibility guidelines',
  },
];

/**
 * Know Your Rights page.
 */
export default function KnowYourRights(): React.JSX.Element {
  const { translate } = useLanguage();

  return (
    <div className="rights-page section">
      <div className="container">
        <div className="section-title">
          <h1>{translate('rights_title', 'Know Your Rights')}</h1>
          <p>{translate('rights_sub', 'Every Indian voter is protected by law. Here\'s what you\'re entitled to.')}</p>
        </div>

        <div className="rights-grid" role="list" aria-label="Voter rights">
          {RIGHTS.map((right, i) => (
            <div key={i} className="rights-card card" role="listitem">
              <span className="rights-icon" aria-hidden="true">{right.icon}</span>
              <h2 className="rights-card-title">{translate(`right_${i}`, right.title)}</h2>
              <p className="rights-card-desc">{translate(`right_d_${i}`, right.desc)}</p>
              <cite className="rights-source">Source: {right.source}</cite>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
