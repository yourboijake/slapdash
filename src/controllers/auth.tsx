import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { SignInPage } from "../views/pages/sign-in-page";
import { SignUpPage } from "../views/pages/sign-up-page";

const app = new Hono();
app.use(jsxRenderer());
app.get("/sign-in", (c) => c.render(<SignInPage />));
app.post("/sign-in", (c) => c.html("sign in post recieved"));
app.get("/sign-up", (c) => c.render(<SignUpPage />));
app.post("/sign-up", (c) => c.html("recieved sign up post req"));

export default app;
