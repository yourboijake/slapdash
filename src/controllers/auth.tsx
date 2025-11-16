import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { SignInPage } from "../views/pages/sign-in-page";
import { SignUpPage } from "../views/pages/sign-up-page";
import { signUpPost, signInPost } from "./endpoint-functions/auth";

const app = new Hono();
app.use(jsxRenderer());
app.get("/sign-in", (c) => c.render(<SignInPage />));
app.post("/sign-in", async (c) => signInPost(c));
app.get("/sign-up", (c) => c.render(<SignUpPage />));
app.post("/sign-up", async (c) => signUpPost(c));

export default app;
