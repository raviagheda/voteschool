/**
 * @fileoverview Notebook page to view saved bookmarks, notes, and AI chats.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { auth, googleProvider } from '../utils/firebase';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { useLanguage } from '../contexts/LanguageContext';
import './Notebook.css';

interface Note {
  id: string;
  type: 'glossary' | 'study' | 'ai_chat';
  title: string;
  content: string;
  timestamp: string;
}

export default function Notebook(): React.JSX.Element {
  const { translate } = useLanguage();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const fetchNotes = useCallback(async (uid: string) => {
    try {
      const response = await fetch(`/api/notes?userId=${uid}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      const fetchedNotes: Note[] = data.notes;
      
      // Sort by timestamp descending
      fetchedNotes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setNotes(fetchedNotes);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load notebook.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        fetchNotes(user.uid);
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchNotes]);

  const handleDelete = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      alert('Failed to delete note.');
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleSignIn = async () => {
    try {
      if (auth && googleProvider) {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error) {
      console.error('Sign-in error:', error);
    }
  };

  if (!isAuthenticated && !loading) {
    return (
      <div className="notebook-page section">
        <div className="container notebook-unauth">
          <h2>{translate('note_unauth', 'Please Sign In')}</h2>
          <p>{translate('note_unauth_sub', 'You need to be signed in to view and save notes.')}</p>
          <button className="btn btn-primary" onClick={handleSignIn} style={{ marginTop: '1.5rem' }}>
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="notebook-page section">
      <div className="container">
        <div className="notebook-header no-print">
          <div className="section-title">
            <h1>{translate('note_title', 'My Notebook 📓')}</h1>
            <p>{translate('note_sub', 'Your saved glossary terms, study notes, and AI conversations.')}</p>
          </div>
          {notes.length > 0 && (
            <button className="btn btn-primary" onClick={handleExportPDF}>
              Export to PDF
            </button>
          )}
        </div>

        {/* This header only shows on the printed PDF */}
        <div className="print-only print-header">
          <h1>VoteSchool Study Notes</h1>
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {loading ? (
          <div className="notebook-loading no-print">Loading notebook...</div>
        ) : error ? (
          <div className="notebook-error no-print">{error}</div>
        ) : notes.length === 0 ? (
          <div className="notebook-empty no-print">
            <p>Your notebook is empty. Bookmark terms from the Glossary or save chats from the AI!</p>
          </div>
        ) : (
          <div className="notebook-grid">
            {notes.map((note) => (
              <div key={note.id} className="note-card card">
                <div className="note-card-header">
                  <span className={`note-badge note-badge--${note.type}`}>
                    {note.type === 'glossary' ? '🔖 Glossary' : note.type === 'ai_chat' ? '💬 AI Chat' : '📚 Study'}
                  </span>
                  <div className="note-actions no-print">
                    <button onClick={() => handleDelete(note.id)} aria-label="Delete note" title="Delete Note">
                      🗑️
                    </button>
                  </div>
                </div>
                <h3 className="note-title">{note.title}</h3>
                <div className="note-content">
                  {note.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </div>
                <div className="note-footer">
                  <small>{new Date(note.timestamp).toLocaleString()}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
