import { Hono } from "hono";
import { logger } from "hono/logger";
import authRoutes from "./controllers/auth";
import chatRoutes from "./controllers/chat";

const app = new Hono();
app.use(logger());
app.route("/", chatRoutes);
app.route("/auth", authRoutes);
export default app;
