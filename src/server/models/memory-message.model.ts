import { index, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { ROLES } from "@/shared/constants/chat.constants";

export const memoryMessages = pgTable(
  "memory_messages",
  {
    id: serial("id").primaryKey(),
    appId: text("app_id").notNull(),
    role: text("role", { enum: ROLES }).notNull(),
    content: text("content").notNull(),
    context: text("context"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => [index("memory_messages_app_id_idx").on(table.appId)]
);

export type MemoryMessageRecord = typeof memoryMessages.$inferSelect;
export type NewMemoryMessageRecord = typeof memoryMessages.$inferInsert;
