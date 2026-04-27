/**
 * @fileoverview EVM Explainer page — diagram, info cards, and FAQ accordion.
 */

import React, { useState, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { trackEvmFaqOpened } from '../utils/analytics';
import './EVMExplainer.css';

interface InfoCard { title: string; desc: string; }
interface FaqItem { q: string; a: string; }

const INFO_CARDS: InfoCard[] = [
  { title: 'What is an EVM?', desc: 'EVM stands for Electronic Voting Machine. It replaced paper ballots in Indian elections to reduce fraud and speed up counting.' },
  { title: 'How is it tamper-proof?', desc: 'EVMs are standalone machines — not connected to the internet or any network. The software is burned once and cannot be modified. Physical seals are verified before every election.' },
  { title: 'What is VVPAT?', desc: 'Voter Verified Paper Audit Trail shows you a paper slip confirming your vote for 7 seconds after you press the button. The slip drops into a sealed transparent box for audit purposes.' },
];

const FAQS: FaqItem[] = [
  { q: 'Can EVMs be hacked remotely?', a: 'No. EVMs have no WiFi, Bluetooth, or internet connectivity. They are physically isolated standalone devices.' },
  { q: 'What if the EVM malfunctions at my booth?', a: 'The Presiding Officer will replace the faulty unit immediately. Your vote is not lost — you will be asked to vote again.' },
  { q: 'Is my vote truly secret on an EVM?', a: 'Yes. The EVM only stores the total count per candidate, not the sequence of votes. It is impossible to link a vote to a specific voter.' },
  { q: 'Who manufactures EVMs?', a: 'EVMs are manufactured only by two government undertakings: BEL (Bharat Electronics Limited) and ECIL (Electronics Corporation of India Limited).' },
  { q: 'What is the VVPAT slip audit?', a: 'After polling, ECI conducts a mandatory random audit of 5 VVPAT machines per constituency to verify EVM counts match the physical paper trail.' },
];

/** EVM Explainer page. */
export default function EVMExplainer(): React.JSX.Element {
  const { translate } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = useCallback((index: number): void => {
    setOpenFaq((prev) => {
      const next = prev === index ? null : index;
      if (next !== null) trackEvmFaqOpened(next);
      return next;
    });
  }, []);

  return (
    <div className="evm-page section">
      <div className="container">
        <div className="section-title">
          <h1>{translate('evm_title', 'EVM — Electronic Voting Machine')}</h1>
          <p>{translate('evm_sub', 'How India votes with technology that is secure, transparent, and tamper-proof.')}</p>
        </div>

        <section className="evm-diagram" aria-labelledby="evm-diagram-heading">
          <h2 id="evm-diagram-heading" className="sr-only">EVM Component Diagram</h2>
          <div className="diagram-wrapper">
            <div className="diagram-unit">
              <div className="diagram-box diagram-box--ballot">
                <span className="diagram-icon" aria-hidden="true">🔘</span>
                <h3>Balloting Unit</h3>
                <p>Where voters press the button next to their candidate</p>
              </div>
              <div className="diagram-connector" aria-hidden="true"><span>←→</span></div>
              <div className="diagram-box diagram-box--control">
                <span className="diagram-icon" aria-hidden="true">🖥️</span>
                <h3>Control Unit</h3>
                <p>Operated by the Presiding Officer to enable voting</p>
              </div>
              <div className="diagram-connector" aria-hidden="true"><span>←→</span></div>
              <div className="diagram-box diagram-box--vvpat">
                <span className="diagram-icon" aria-hidden="true">🖨️</span>
                <h3>VVPAT</h3>
                <p>Prints a paper slip for voter verification (7 seconds)</p>
              </div>
            </div>
          </div>
        </section>

        <section className="evm-cards" aria-labelledby="evm-info-heading">
          <h2 id="evm-info-heading" className="sr-only">EVM Information</h2>
          <div className="info-cards-grid">
            {INFO_CARDS.map((card, i) => (
              <div key={i} className="card info-card">
                <h3>{translate(`evm_card_${i}`, card.title)}</h3>
                <p>{translate(`evm_card_d_${i}`, card.desc)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="evm-faq" aria-labelledby="evm-faq-heading">
          <h2 id="evm-faq-heading">{translate('evm_faq', 'Frequently Asked Questions')}</h2>
          <div className="faq-list" role="list">
            {FAQS.map((faq, i) => (
              <div key={i} className="faq-item" role="listitem">
                <button
                  className={`faq-question ${openFaq === i ? 'faq-question--open' : ''}`}
                  onClick={() => toggleFaq(i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-answer-${i}`}
                  aria-label={`FAQ: ${faq.q}`}
                  type="button"
                >
                  <span>{translate(`faq_q_${i}`, faq.q)}</span>
                  <span className="faq-chevron" aria-hidden="true">{openFaq === i ? '−' : '+'}</span>
                </button>
                <div id={`faq-answer-${i}`} className={`faq-answer ${openFaq === i ? 'faq-answer--open' : ''}`} role="region">
                  <p>{translate(`faq_a_${i}`, faq.a)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
