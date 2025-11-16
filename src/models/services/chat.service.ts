import { db } from "../index";
import * as schema from "../schema";
import { eq } from "drizzle-orm";

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
