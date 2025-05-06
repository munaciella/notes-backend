import express, { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { getDb } from '../lib/db';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post(
  '/',
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const db = getDb();
    const { title, content, tags = [] } = req.body;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Summarize the following note in one paragraph:' },
        { role: 'user', content },
      ],
    });
    const summary = completion.choices[0]?.message?.content ?? '';

    const result = await db.query(
      `INSERT INTO notes (user_id, title, content, summary, tags)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [userId, title, content, summary, tags]
    );

    res.status(201).json(result.rows[0]);
  }
);

router.get(
  '/',
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const db = getDb();
    const { tag, q } = req.query;
    const params: any[] = [userId];
    let sql = `SELECT * FROM notes WHERE user_id = $1`;

    if (tag) {
      params.push(tag);
      sql += ` AND $${params.length} = ANY(tags)`;
    }
    if (q) {
      params.push(`%${q}%`);
      sql += ` AND (title ILIKE $${params.length} OR content ILIKE $${params.length})`;
    }

    const { rows } = await db.query(sql, params);
    res.json(rows);
  }
);

router.get(
  '/:id',
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const db = getDb();
    const { id } = req.params;
    const { rows } = await db.query(
      `SELECT * FROM notes WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    res.json(rows[0]);
  }
);

router.put(
  '/:id',
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const db = getDb();
    const { id } = req.params;
    const { title, content, tags } = req.body;
    const { rows } = await db.query(
      `UPDATE notes
       SET title=$1, content=$2, tags=$3, updated_at=now()
       WHERE id=$4 AND user_id=$5 RETURNING *`,
      [title, content, tags, id, userId]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    res.json(rows[0]);
  }
);

router.delete(
  '/:id',
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const db = getDb();
    const { id } = req.params;
    await db.query(`DELETE FROM notes WHERE id=$1 AND user_id=$2`, [id, userId]);
    res.status(204).send();
  }
);

export { router as notesRouter };
