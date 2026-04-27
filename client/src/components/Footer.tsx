/**
 * @fileoverview Footer component with ECI attribution and helpline info.
 */

import React from 'react';
import './Footer.css';

/** Site footer with data source attribution and contact info. */
export default function Footer(): React.JSX.Element {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container footer-inner">
        <div className="footer-brand">
          <img src="/logo.png" alt="" className="footer-logo-img" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          <span className="footer-name">VoteSchool</span>
          <p className="footer-tagline">Know your vote. Own your democracy.</p>
        </div>
        <div className="footer-info">
          <p>
            Data sourced from ECI —{' '}
            <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer" aria-label="Visit Election Commission of India voter portal">
              voters.eci.gov.in
            </a>
          </p>
          <p>
            ECI Voter Helpline:{' '}
            <a href="tel:1950" aria-label="Call ECI Voter Helpline 1950"><strong>1950</strong></a>
          </p>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} VoteSchool. Built for PromptWars Virtual.</p>
        </div>
      </div>
    </footer>
  );
}
