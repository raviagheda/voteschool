/**
 * @fileoverview Main App component with lazy-loaded routes and GA4 page tracking.
 */

import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SkipLink from './components/SkipLink';
import { Toaster } from 'react-hot-toast';

// Lazy-loaded page components for code splitting
const Home = lazy(() => import('./pages/Home'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const EVMExplainer = lazy(() => import('./pages/EVMExplainer'));
const Glossary = lazy(() => import('./pages/Glossary'));
const Checklist = lazy(() => import('./pages/Checklist'));
const KnowYourRights = lazy(() => import('./pages/KnowYourRights'));
const Quiz = lazy(() => import('./pages/Quiz'));
const AskAI = lazy(() => import('./pages/AskAI'));
const Notebook = lazy(() => import('./pages/Notebook'));

/**
 * Loading fallback component shown while lazy pages are loading.
 */
function LoadingFallback(): React.JSX.Element {
  return (
    <div className="loading-fallback" role="status" aria-label="Loading page content">
      <div className="loading-spinner" />
      <p>Loading...</p>
    </div>
  );
}

/**
 * Main application component.
 * Sets up routing, GA4 page view tracking, and layout structure.
 */
function App(): React.JSX.Element {
  const location = useLocation();

  // Track page views with GA4 on route change
  useEffect(() => {
    if (typeof window.gtag === 'function' && window.GA_MEASUREMENT_ID && window.GA_MEASUREMENT_ID !== '__GA_MEASUREMENT_ID__') {
      window.gtag('config', window.GA_MEASUREMENT_ID, {
        page_path: location.pathname,
      });
    }
  }, [location]);

  return (
    <>
      <Toaster position="bottom-right" />
      <SkipLink />
      <Navbar />
      <main id="main-content" role="main">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/evm" element={<EVMExplainer />} />
            <Route path="/glossary" element={<Glossary />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/rights" element={<KnowYourRights />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/notebook" element={<Notebook />} />
            <Route path="/chat" element={<AskAI />} />
          </Routes>
        </Suspense>
      </main>
      {location.pathname !== '/chat' && <Footer />}
    </>
  );
}

export default App;
