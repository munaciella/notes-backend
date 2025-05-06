import { RequestHandler } from 'express';
import { verifyToken } from '@clerk/clerk-sdk-node';

export const clerkMiddleware: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Missing auth header' });
    return;
  }
  const token = authHeader.replace('Bearer ', '');
  verifyToken(token, { issuer: 'https://your-issuer-url.com' })
    .then((session) => {
      (req as any).userId = session.sub;
      next();
    })
    .catch(() => {
      res.status(401).json({ error: 'Invalid or expired token' });
    });
};
