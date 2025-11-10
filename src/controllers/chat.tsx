import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { ChatPage } from "../views/pages/chat-page";

const app = new Hono();

app.use(jsxRenderer());
app.get("/chat", (c) => c.render(<ChatPage />));
app.get("/chat/:id", (c) => c.html(`chat page for ${c.req.param("id")}`));

export default app;
