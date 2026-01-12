import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { ChatPage } from "../views/pages/chat-page";
import { validateSession } from "../models/services/session.service";
import { upgradeWebSocket, websocket } from "hono/bun";
import { createMiddleware } from "hono/factory";
import type { ServerWebSocket } from "bun";

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
  (c, next) => {
    const isValidSession = validateSession(c);
    if (!isValidSession) {
      console.log("hit ws session middleware, no valid session");
      return c.text("unauthorized", 401);
    }
    return next();
  },
  upgradeWebSocket(async (c) => {
    return {
      onOpen(evt, ws) {
        const rawWs = ws.raw as ServerWebSocket;
        rawWs.subscribe("chat-room");
        console.log("opening ws connection from", ws.url?.hostname);
      },
      onMessage(evt, ws) {
        console.log("event data", evt.data);
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
