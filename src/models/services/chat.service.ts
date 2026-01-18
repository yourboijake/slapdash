import { db } from "../index";
import * as schema from "../schema";
import { eq } from "drizzle-orm";
import { ChatSession } from "../types";

export async function getChatMetadata(id: number) {
  try {
    const chat = await db
      .select()
      .from(schema.chatSession)
      .where(eq(schema.chatSession.id, id));
    if (chat.length === 0 || !chat) {
      return null;
    }
    return chat[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getChatHistory(chatSessionId: number) {
  try {
    const chatHistory = await db
      .select()
      .from(schema.chatMessage)
      .where(eq(schema.chatMessage.chatSessionId, chatSessionId));
    return chatHistory;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getOrCreateChatSession(
  sessionId: number,
): Promise<ChatSession | null> {
  try {
    const existingChatSession = await db.query.chatSession.findFirst({
      where: eq(schema.chatSession.id, sessionId),
    });
    if (existingChatSession) {
      return existingChatSession;
    }

    const newChatSession = await db
      .insert(schema.chatSession)
      .values({})
      .returning();
    if (newChatSession.length === 0) {
      return null;
    }
    return newChatSession[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function saveChatMessage(
  newChat: typeof schema.chatMessage.$inferInsert,
) {
  try {
    const newMessage = await db
      .insert(schema.chatMessage)
      .values(newChat)
      .returning();
    if (newMessage.length === 0) {
      return null;
    }
    return newMessage[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}
