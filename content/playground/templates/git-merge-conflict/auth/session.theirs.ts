// fix/session-expiry — changes return type and deletes expired sessions.
import { db } from '../db';

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

export const validateSession = async (token: string): Promise<Session | null> => {
  const session = await db.sessions.findByToken(token);
  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await db.sessions.delete(session.id);
    return null;
  }
  return session;
};
