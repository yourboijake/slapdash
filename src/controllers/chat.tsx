import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { ChatPage } from "../views/pages/chat-page";
import { validateSession } from "../models/services/session.service";

const app = new Hono();

app.use(jsxRenderer());
app.get("/chat", async (c) => {
  const isValidSession = await validateSession(c);
  if (!isValidSession) {
    return c.redirect("/auth/sign-in");
  }
  return c.render(<ChatPage chatSessionId={1} />);
});
app.get("/chat/:id", async (c) => {
  const isValidSession = await validateSession(c);
  const chatId: number = Number(c.req.param().id);
  if (!isValidSession) {
    return c.redirect("/auth/sign-in");
  }
  return c.render(<ChatPage chatSessionId={chatId} />);
});

export default app;
