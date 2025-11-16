import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getSignedCookie, setSignedCookie } from "hono/cookie";
import { jsxRenderer } from "hono/jsx-renderer";
import { SignInPage } from "../views/pages/sign-in-page";
import { SignUpPage } from "../views/pages/sign-up-page";
import { createUser } from "../models/services/user.service";
import * as dotenv from "dotenv";
import { createSession } from "../models/services/session.service";

export type FormData = {
  [x: string]: string | File;
};

const app = new Hono();
app.use(jsxRenderer());
app.get("/sign-in", (c) => c.render(<SignInPage />));
app.post("/sign-in", (c) => c.html("sign in post recieved"));
app.get("/sign-up", (c) => c.render(<SignUpPage />));
app.post("/sign-up", async (c) => {
  const formData: FormData = await c.req.parseBody();
  const createUserResult = await createUser(formData);
  if (createUserResult.error) {
    throw new HTTPException(createUserResult.error.status, {
      message: createUserResult.error.message,
    });
  } else if (!createUserResult.newUser) {
    throw new HTTPException(500, { message: "Failed to create new user" });
  }
  const newSession = await createSession(createUserResult.newUser.id);
  if (!newSession) {
    throw new HTTPException(500, {
      message: "Failed to create session for newly created user",
    });
  }
  dotenv.config();
  const cookieSecret = process.env.COOKIE_SECRET || "set-cookie-secret!";
  await setSignedCookie(c, "session", newSession.id, cookieSecret);
  return c.redirect("/chat");
});

export default app;
