import type { WSMessageReceive } from "hono/ws";
import type { chatMessage, chatSession } from "./schema";
import { z } from "zod";

export type ChatMessageInsert = typeof chatMessage.$inferInsert;
export type ChatSession = typeof chatSession.$inferSelect;

export type WSChatMessage = {
  chatSessionId: number;
  message: string;
  HEADERS: Record<string, string | null>;
};

const WSChatMessageSchema = z.object({
  chat_session_id: z.coerce.number(),
  message: z.string(),
  HEADERS: z.record(z.string(), z.string().nullable()),
});

export async function convertToWSChatMessage(
  input: WSMessageReceive,
): Promise<WSChatMessage | null> {
  try {
    let parsed: any;
    if (typeof input === "string") {
      parsed = JSON.parse(input);
    } else {
      const text =
        input instanceof Blob
          ? await input.text()
          : new TextDecoder().decode(input as ArrayBuffer);
      parsed = JSON.parse(text);
    }

    const zodCheckResult = WSChatMessageSchema.safeParse(parsed);
    if (!zodCheckResult.success) {
      console.error("Invalid WSChatMessage:", zodCheckResult.error);
      return null;
    }

    const result: WSChatMessage = {
      chatSessionId: zodCheckResult.data.chat_session_id,
      message: zodCheckResult.data.message,
      HEADERS: zodCheckResult.data.HEADERS,
    };
    return result;
  } catch (error) {
    console.error("Error converting WSMessageReceive to WSChatMessage:", error);
    return null;
  }
}
