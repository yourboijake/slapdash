import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { ChatPage } from "../views/pages/chat-page";
import { validateSession } from "../models/services/session.service";
import { upgradeWebSocket } from "hono/bun";
import { createMiddleware } from "hono/factory";
import type { ServerWebSocket } from "bun";
import {
  getOrCreateChatSession,
  saveChatMessage,
} from "../models/services/chat.service";
import {
  type ChatMessageInsert,
  convertToWSChatMessage,
} from "../models/types";

const app = new Hono<{ Variables: Variables }>();

type Variables = {
  userId: number;
};

const validSessionMiddleware = createMiddleware(async (c, next) => {
  const sessionValidationResult = await validateSession(c);
  if (!sessionValidationResult.isValid) {
    console.log("hit session middleware, no valid session");
    return c.redirect("/auth/sign-in");
  }
  c.set("userId", sessionValidationResult.sessionData.userId); // You need to replace "someUserId" with the actual user ID from the session or context
  await next();
});

app.use(jsxRenderer());
app.use("/chat/*", validSessionMiddleware);
app.get("/chat", async (c) => {
  const userId = c.get("userId");
  return c.render(<ChatPage chatSessionId={1} userId={userId} />);
});
app.get("/chat/:id", async (c) => {
  const chatId = Number(c.req.param("id"));
  const userId = c.get("userId");
  return c.render(<ChatPage chatSessionId={chatId} userId={userId} />);
});
app.get(
  "/chat-ws",
  upgradeWebSocket(async (c) => {
    const sessionValidationResult = await validateSession(c);
    if (!sessionValidationResult.isValid) {
      console.log("hit ws session validation, no valid session");
      return {};
    }
    const userId = sessionValidationResult.sessionData.userId;
    return {
      onOpen(evt, ws) {
        const rawWs = ws.raw as ServerWebSocket;
        rawWs.subscribe("chat-room");
        console.log("opening ws connection from", ws.url?.hostname);
      },
      async onMessage(evt, ws) {
        const wsChatMessage = await convertToWSChatMessage(evt.data);
        if (!wsChatMessage) {
          console.error("Invalid WS chat message received: ", evt.data);
          return;
        }
        console.log(wsChatMessage);
        const newChat: ChatMessageInsert = {
          chatSessionId: wsChatMessage.chatSessionId,
          senderId: userId,
          content: wsChatMessage.message,
        };

        const chatSession = await getOrCreateChatSession(
          wsChatMessage.chatSessionId,
        );
        if (!chatSession) {
          console.error(
            "Failed to get or create chat session for id:",
            wsChatMessage.chatSessionId,
          );
          return;
        }
        const res = await saveChatMessage(newChat);
        if (!res) {
          console.error("Failed to save chat message:", newChat);
          return;
        }
        const rawWs = ws.raw as ServerWebSocket;
        rawWs.publish("chat-room", JSON.stringify(res));
      },
      onError(evt, ws) {
        console.error("encountered error");
      },
      onClose(evt, ws) {
        ws.close();
      },
    };
  }),
);

export default app;
