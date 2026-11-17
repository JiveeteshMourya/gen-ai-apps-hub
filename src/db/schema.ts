import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const ROLES = ["user", "assistant"] as const;
export type Role = (typeof ROLES)[number];

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  role: text("role", { enum: ROLES }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
