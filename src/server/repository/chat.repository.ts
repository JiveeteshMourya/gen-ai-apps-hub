import { db } from "@/server/lib/db";
import { messages } from "@/server/models";
import { CONTEXT_WINDOW } from "@/shared/constants/chat.constants";
import { asc, desc } from "drizzle-orm";

export const chatRepository = {
  /** All messages, chronological — for the UI feed */
  getAll: () => db.select().from(messages).orderBy(asc(messages.createdAt)),

  /** Most recent N messages, chronological — for OpenAI context */
  getRecent: () =>
    db
      .select()
      .from(messages)
      .orderBy(desc(messages.createdAt))
      .limit(CONTEXT_WINDOW)
      .then(rows => rows.reverse()),

  insertUser: (content: string) => db.insert(messages).values({ role: "user", content }),

  insertAssistant: (content: string) => db.insert(messages).values({ role: "assistant", content }),

  deleteAll: () => db.delete(messages),
};
