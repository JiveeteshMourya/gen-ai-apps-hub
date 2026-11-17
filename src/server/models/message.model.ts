import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { ROLES } from "@/shared/constants/chat.constants";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  role: text("role", { enum: ROLES }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MessageRecord = typeof messages.$inferSelect;
