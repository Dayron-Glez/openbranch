export interface SessionRecord {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export const db = {
  sessions: {
    findByToken: async (_token: string): Promise<SessionRecord | null> => null,
    delete: async (_id: string): Promise<void> => {},
  },
};
