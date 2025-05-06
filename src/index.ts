import 'dotenv/config';
import express from 'express';
import { json } from 'body-parser';
import { initDb } from './lib/db';
import { notesRouter } from './routes/notes';
import { clerkMiddleware } from './lib/clerk';

const app = express();
app.use(json());

// Initialize DB pool
initDb(process.env.DATABASE_URL!);

// Clerk authentication
app.use(clerkMiddleware);

// Notes routes
app.use('/notes', notesRouter);

const port = +process.env.PORT!;
app.listen(port, () => {
  console.log(`🚀 Backend running on http://localhost:${port}`);
});

