import { index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { ROLES } from "@/shared/constants/chat.constants";

export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    appId: text("app_id").notNull(),
    role: text("role", { enum: ROLES }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => [index("messages_app_id_idx").on(table.appId)]
);

export type MessageRecord = typeof messages.$inferSelect;
export type NewMessageRecord = typeof messages.$inferInsert;
