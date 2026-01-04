import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { ChatPage } from "../views/pages/chat-page";
import { validateSession } from "../models/services/session.service";
import { upgradeWebSocket, websocket } from "hono/bun";
import { createMiddleware } from "hono/factory";
import type { ServerWebSocket } from "bun";

const app = new Hono();

const validSessionMiddleware = createMiddleware(async (c, next) => {
  const isValidSession = await validateSession(c);
  if (!isValidSession) {
    console.log("hit session middleware, no valid session");
    return c.redirect("/auth/sign-in");
  }
  await next();
});

app.use(jsxRenderer());
app.use("/chat/*", validSessionMiddleware);
app.get("/chat", async (c) => {
  return c.render(<ChatPage chatSessionId={1} />);
});
app.get("/chat/:id", async (c) => {
  const chatId = Number(c.req.param("id"));
  return c.render(<ChatPage chatSessionId={chatId} />);
});
app.get(
  "/chat-ws",
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
