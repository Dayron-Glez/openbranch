<<<<<<< HEAD (feat/rate-limiting)
import { db } from '../db';
import { RateLimiter } from '../rate-limiter';
=======
import { db } from '../db';
>>>>>>> fix/session-expiry

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

<<<<<<< HEAD (feat/rate-limiting)
const limiter = new RateLimiter({ maxRequests: 100, windowMs: 60_000 });

export const validateSession = async (token: string): Promise<boolean> => {
  if (!limiter.allow(token)) return false;
  const session = await db.sessions.findByToken(token);
  if (!session) return false;
  return session.expiresAt > new Date();
=======
export const validateSession = async (token: string): Promise<Session | null> => {
  const session = await db.sessions.findByToken(token);
  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await db.sessions.delete(session.id);
    return null;
  }
  return session;
>>>>>>> fix/session-expiry
};
