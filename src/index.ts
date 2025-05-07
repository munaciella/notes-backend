import 'dotenv/config';
import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import { initDb } from './lib/db';
import { notesRouter } from './routes/notes';

const app = express();

// CORS
const devOrigin = 'http://localhost:3000';
const prodOrigin = process.env.NEXT_PUBLIC_FRONTEND_URL;
app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? devOrigin : prodOrigin,
  credentials: true,
}));

app.use(json());

// Initialize the database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}
initDb(connectionString);

if (process.env.NODE_ENV === 'development') {
  // DEV: stub so you can keep testing without Clerk
  app.use(
    '/notes',
    (req: any, _res, next) => {
      req.auth = { userId: 'dev-user', sessionId: '', orgId: null, getToken: async () => '' };
      next();
    },
    notesRouter
  );
} else {
  // PROD: real Clerk protection
  // 1) Parse & verify the Clerk session on every request
  app.use(clerkMiddleware());
  // 2) Block unauthenticated calls to /notes
  app.use('/notes', requireAuth(), notesRouter);
}

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`🚀 Backend running on http://localhost:${port}`);
});
