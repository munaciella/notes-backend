import 'dotenv/config';
import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
//import { clerkMiddleware, requireAuth } from '@clerk/express';
import { initDb } from './lib/db';
import { notesRouter } from './routes/notes';

const app = express();

// 1) CORS: allow your frontend origins
const devOrigin = 'http://localhost:3000';
const prodOrigin = process.env.NEXT_PUBLIC_FRONTEND_URL; // you’ll set this in Render
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

// === DEV‐ONLY AUTH STUB ===
// This will run for *all* /notes routes and inject userId
app.use(
    '/notes',
    (req: any, _res, next) => {
      req.auth = { userId: 'dev-user', sessionId: '', orgId: null, getToken: async () => '' };
      next();
    },
    notesRouter
  );

// if (process.env.NODE_ENV === 'development') {
//     // DEV: inject a fake req.auth so getAuth(req) works in your routes
//     app.use(
//       '/notes',
//       (req: any, _res, next) => {
//         req.auth = {
//           userId: 'dev-user',
//           sessionId: 'dev-session',
//           orgId: null,
//           getToken: async () => '',
//         };
//         next();
//       },
//       notesRouter
//     );
//   } else {
//     // PROD: real Clerk protection
//     app.use(clerkMiddleware());
//     app.use('/notes', requireAuth(), notesRouter);
//   }

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`🚀 Backend running on http://localhost:${port}`);
});
