import { Router, Request, Response } from 'express';
import { getDb } from '../services/firebase';

const router = Router();

// GET /api/notes?userId=...
router.get('/', async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const db = getDb();
  if (!db) {
    return res.status(503).json({ error: 'Database not initialized' });
  }

  try {
    const snapshot = await db.collection('notes')
      .where('userId', '==', userId)
      .get();

    const notes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.json({ notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// POST /api/notes
router.post('/', async (req: Request, res: Response) => {
  const { userId, type, title, content, timestamp } = req.body;

  if (!userId || !type || !title || !content || !timestamp) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const db = getDb();
  if (!db) {
    return res.status(503).json({ error: 'Database not initialized' });
  }

  try {
    const docRef = await db.collection('notes').add({
      userId,
      type,
      title,
      content,
      timestamp
    });

    return res.status(201).json({ id: docRef.id });
  } catch (error) {
    console.error('Error saving note:', error);
    return res.status(500).json({ error: 'Failed to save note' });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const noteId = req.params.id;

  const db = getDb();
  if (!db) {
    return res.status(503).json({ error: 'Database not initialized' });
  }

  try {
    await db.collection('notes').doc(noteId).delete();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
