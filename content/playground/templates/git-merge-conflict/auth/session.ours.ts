// feat/rate-limiting — adds RateLimiter to prevent token abuse.
import { db } from '../db';
import { RateLimiter } from '../rate-limiter';

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

const limiter = new RateLimiter({ maxRequests: 100, windowMs: 60_000 });

export const validateSession = async (token: string): Promise<boolean> => {
  if (!limiter.allow(token)) return false;
  const session = await db.sessions.findByToken(token);
  if (!session) return false;
  return session.expiresAt > new Date();
};
