import { db, ensureDbInitialized } from "@/server/lib/db";
import { messages } from "@/server/models";
import { CONTEXT_WINDOW } from "@/shared/constants/chat.constants";
import { asc, desc, eq } from "drizzle-orm";

export const chatRepository = {
  /** All messages for a given app, chronological — for the UI feed */
  getAllByApp: async (appId: string) => {
    await ensureDbInitialized();
    return db
      .select()
      .from(messages)
      .where(eq(messages.appId, appId))
      .orderBy(asc(messages.createdAt));
  },

  /** Most recent N messages for a given app, chronological — for OpenAI context */
  getRecentByApp: async (appId: string) => {
    await ensureDbInitialized();
    return db
      .select()
      .from(messages)
      .where(eq(messages.appId, appId))
      .orderBy(desc(messages.createdAt))
      .limit(CONTEXT_WINDOW)
      .then(rows => rows.reverse());
  },

  insertUser: async (appId: string, content: string) => {
    await ensureDbInitialized();
    return db.insert(messages).values({ appId, role: "user", content });
  },

  insertAssistant: async (appId: string, content: string) => {
    await ensureDbInitialized();
    return db.insert(messages).values({ appId, role: "assistant", content });
  },

  deleteByApp: async (appId: string) => {
    await ensureDbInitialized();
    return db.delete(messages).where(eq(messages.appId, appId));
  },

  deleteAll: async () => {
    await ensureDbInitialized();
    return db.delete(messages);
  },
};
