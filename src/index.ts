import 'dotenv/config';
import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import { initDb } from './lib/db';
import { notesRouter } from './routes/notes';

const app = express();

const devOrigin = 'http://localhost:3000';
const prodOrigin = process.env.NEXT_PUBLIC_FRONTEND_URL;
app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? devOrigin : prodOrigin,
  credentials: true,
}));

app.use(json());

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}
initDb(connectionString);

if (process.env.NODE_ENV === 'development') {
  app.use(
    '/notes',
    (req: any, _res, next) => {
      req.auth = { userId: 'dev-user', sessionId: '', orgId: null, getToken: async () => '' };
      next();
    },
    notesRouter
  );
} else {
  
  app.use(clerkMiddleware());

  app.use('/notes', requireAuth(), notesRouter);
}

app.use((err: any, req: any, res: any, next: any) => {
  console.error('🔥 Uncaught error:', err);
  res
  .status(err.status || 500)
  .json({ error: err.message || 'Internal Server Error' });
});


const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`🚀 Backend running on http://localhost:${port}`);
});
