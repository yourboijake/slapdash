import { int, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const user = sqliteTable("user", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  password: text().notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const chatMessage = sqliteTable("chat_message", {
  id: int().primaryKey({ autoIncrement: true }),
  chatSessionId: int("chat_session_id")
    .notNull()
    .references(() => chatSession.id),
  senderId: int("sender_id")
    .notNull()
    .references(() => user.id),
  content: text().notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const chatSession = sqliteTable("chat_session", {
  id: int().primaryKey({ autoIncrement: true }),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const chatSessionMember = sqliteTable("chat_session_member", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int("user_id").references(() => user.id),
  chatSessionId: int("chat_session_id").references(() => chatSession.id),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const session = sqliteTable(
  "session",
  {
    id: text().primaryKey().default(sql`(lower(hex(randomblob(32))))`),
    userId: int("user_id").references(() => user.id),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    expiresAt: text("expires_at")
      .notNull()
      .default(sql`(datetime(current_timestamp, '+1 hour'))`),
  },
  (table) => [uniqueIndex("session_user_index").on(table.userId)],
);
