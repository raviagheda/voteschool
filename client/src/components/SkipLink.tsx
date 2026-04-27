/**
 * @fileoverview Skip-to-content accessibility link.
 */

import React from 'react';

/** Skip link component for keyboard accessibility. */
export default function SkipLink(): React.JSX.Element {
  return (
    <a href="#main-content" className="skip-link" aria-label="Skip to main content">
      Skip to main content
    </a>
  );
}
