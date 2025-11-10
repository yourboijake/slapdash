import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  password: text().notNull(),
  created_at: text().notNull().default(sql`datetime('now')`),
});

export const chatMessage = sqliteTable("chat_message", {
  id: int().primaryKey({ autoIncrement: true }),
  chatSessionId: int()
    .notNull()
    .references(() => chatSession.id),
  senderId: int()
    .notNull()
    .references(() => users.id),
  content: text().notNull(),
  created_at: text().notNull().default(sql`datetime('now')`),
});

export const chatSession = sqliteTable("chat_session", {
  id: int().primaryKey({ autoIncrement: true }),
  created_at: text().notNull().default(sql`datetime('now')`),
});

export const chatSessionMember = sqliteTable("chat_session_member", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int().references(() => users.id),
  chatSessionId: int().references(() => chatSession.id),
  created_at: text().notNull().default(sql`datetime('now')`),
});
