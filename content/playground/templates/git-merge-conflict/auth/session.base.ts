// Base version — before either branch touched this file.
import { db } from '../db';

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

export const validateSession = async (token: string): Promise<boolean> => {
  const session = await db.sessions.findByToken(token);
  if (!session) return false;
  return session.expiresAt > new Date();
};
