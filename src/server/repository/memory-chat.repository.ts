import { db, ensureDbInitialized } from "@/server/lib/db";
import { memoryMessages } from "@/server/models/memory-message.model";
import { CONTEXT_WINDOW } from "@/shared/constants/chat.constants";
import { asc, desc, eq } from "drizzle-orm";

export const memoryChatRepository = {
  /** All memory messages for a given app, chronological — for the UI feed */
  getAllByApp: async (appId: string) => {
    await ensureDbInitialized();
    return db
      .select()
      .from(memoryMessages)
      .where(eq(memoryMessages.appId, appId))
      .orderBy(asc(memoryMessages.createdAt));
  },

  /** Most recent N memory messages for a given app, chronological — for context */
  getRecentByApp: async (appId: string) => {
    await ensureDbInitialized();
    return db
      .select()
      .from(memoryMessages)
      .where(eq(memoryMessages.appId, appId))
      .orderBy(desc(memoryMessages.createdAt))
      .limit(CONTEXT_WINDOW)
      .then(rows => rows.reverse());
  },

  insertUser: async (appId: string, content: string) => {
    await ensureDbInitialized();
    return db.insert(memoryMessages).values({ appId, role: "user", content });
  },

  insertAssistant: async (
    appId: string,
    content: string,
    context?: string | null,
    metadata?: Record<string, unknown> | null
  ) => {
    await ensureDbInitialized();
    return db.insert(memoryMessages).values({
      appId,
      role: "assistant",
      content,
      context: context ?? null,
      metadata: metadata ?? null,
    });
  },

  deleteByApp: async (appId: string) => {
    await ensureDbInitialized();
    return db.delete(memoryMessages).where(eq(memoryMessages.appId, appId));
  },

  deleteAll: async () => {
    await ensureDbInitialized();
    return db.delete(memoryMessages);
  },
};
