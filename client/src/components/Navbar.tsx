/**
 * @fileoverview Sticky top navigation bar with language toggle and mobile hamburger menu.
 */

import React, { useState, useCallback, useEffect, KeyboardEvent } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { auth, googleProvider } from '../utils/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import './Navbar.css';

/** Navigation link item shape. */
interface NavLinkItem {
  to: string;
  label: string;
}

const NAV_LINKS: NavLinkItem[] = [
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/evm', label: 'EVM' },
  { to: '/glossary', label: 'Glossary' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/notebook', label: 'Notebook' },
  { to: '/chat', label: 'Ask AI' },
];

/**
 * Sticky navbar with logo, nav links, language toggle, and mobile hamburger.
 */
export default function Navbar(): React.JSX.Element {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async (): Promise<void> => {
    try {
      if (auth && googleProvider) {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error) {
      console.error('Sign-in error:', error);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  const handleToggleMenu = useCallback((): void => {
    setMenuOpen((prev) => !prev);
  }, []);

  const handleKeyDownMenu = useCallback((e: KeyboardEvent<HTMLElement>): void => {
    if (e.key === 'Escape') setMenuOpen(false);
  }, []);

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation" onKeyDown={handleKeyDownMenu}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo" aria-label="VoteSchool home">
          <img src="/logo.png" alt="VoteSchool Logo" className="logo-icon-img" />
          <span className="logo-text">VoteSchool</span>
        </Link>

        <ul className={`navbar-links ${menuOpen ? 'navbar-links--open' : ''}`} role="menubar">
          {NAV_LINKS.map((link) => (
            <li key={link.to} role="none">
              <NavLink
                to={link.to}
                className={({ isActive }) => `navbar-link ${isActive ? 'navbar-link--active' : ''}`}
                role="menuitem"
                aria-label={`Navigate to ${link.label}`}
                tabIndex={0}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          <button
            className="lang-toggle"
            onClick={toggleLanguage}
            aria-label={`Switch language to ${language === 'en' ? 'Hindi' : 'English'}`}
            type="button"
          >
            {language === 'en' ? 'हिं' : 'EN'}
          </button>

          {currentUser ? (
            <button className="btn btn-outline nav-auth-btn" onClick={handleSignOut}>
              Sign Out
            </button>
          ) : (
            <button className="btn btn-primary nav-auth-btn" onClick={handleSignIn}>
              Sign In
            </button>
          )}

          <button
            className={`hamburger ${menuOpen ? 'hamburger--active' : ''}`}
            onClick={handleToggleMenu}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            type="button"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="navbar-overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}
    </nav>
  );
}
