import { Hono } from "hono";
import { logger } from "hono/logger";
import authRoutes from "./controllers/auth";
import chatRoutes from "./controllers/chat";
import { upgradeWebSocket, websocket } from "hono/bun";
import { html } from "hono/html";
import type { ServerWebSocket } from "bun";

const app = new Hono();
app.use(logger());
app.route("/", chatRoutes);
app.route("/auth", authRoutes);

export default {
  fetch: app.fetch,
  websocket,
};
