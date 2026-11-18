import { index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { ROLES } from "@/shared/constants/chat.constants";

export const directMessages = pgTable(
  "direct_messages",
  {
    id: serial("id").primaryKey(),
    appId: text("app_id").notNull(),
    role: text("role", { enum: ROLES }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => [index("direct_messages_app_id_idx").on(table.appId)]
);

export type DirectMessageRecord = typeof directMessages.$inferSelect;
export type NewDirectMessageRecord = typeof directMessages.$inferInsert;
