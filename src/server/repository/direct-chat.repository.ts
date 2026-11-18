import { db, ensureDbInitialized } from "@/server/lib/db";
import { directMessages } from "@/server/models/direct-message.model";
import { CONTEXT_WINDOW } from "@/shared/constants/chat.constants";
import { asc, desc, eq } from "drizzle-orm";

export const directChatRepository = {
  /** All direct messages for a given app, chronological — for the UI feed */
  getAllByApp: async (appId: string) => {
    await ensureDbInitialized();
    return db
      .select()
      .from(directMessages)
      .where(eq(directMessages.appId, appId))
      .orderBy(asc(directMessages.createdAt));
  },

  /** Most recent N direct messages for a given app, chronological — for OpenAI context */
  getRecentByApp: async (appId: string) => {
    await ensureDbInitialized();
    return db
      .select()
      .from(directMessages)
      .where(eq(directMessages.appId, appId))
      .orderBy(desc(directMessages.createdAt))
      .limit(CONTEXT_WINDOW)
      .then(rows => rows.reverse());
  },

  insertUser: async (appId: string, content: string) => {
    await ensureDbInitialized();
    return db.insert(directMessages).values({ appId, role: "user", content });
  },

  insertAssistant: async (appId: string, content: string) => {
    await ensureDbInitialized();
    return db.insert(directMessages).values({ appId, role: "assistant", content });
  },

  deleteByApp: async (appId: string) => {
    await ensureDbInitialized();
    return db.delete(directMessages).where(eq(directMessages.appId, appId));
  },

  deleteAll: async () => {
    await ensureDbInitialized();
    return db.delete(directMessages);
  },
};
