import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { setSignedCookie } from "hono/cookie";
import { createUser, validateSignIn } from "../../models/services/user.service";
import * as dotenv from "dotenv";
import {
  createSession,
  getSessionCookieSecret,
  retrieveOrCreateSession,
} from "../../models/services/session.service";
import { AuthFailureToast } from "../../views/components/auth/auth-failure-toast";

export async function signUpPost(c: Context) {
  const formData = await c.req.formData();
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
  await setSignedCookie(c, "session", newSession.id, cookieSecret, {
    secure: true,
    httpOnly: true,
    expires: new Date(newSession.expiresAt),
    sameSite: "strict",
  });
  return c.redirect("/chat");
}

export async function signInPost(c: Context) {
  const formData = await c.req.formData();
  const signInValidation = await validateSignIn(formData);
  if (signInValidation.error || !signInValidation.user) {
    const errorMessage = "Invalid email or password";
    return c.render(<AuthFailureToast errorMessage={errorMessage} />);
  }
  const session = await retrieveOrCreateSession(signInValidation.user.id);
  if (!session) {
    throw new HTTPException(500, {
      message: "Failed to create session for newly created user",
    });
  }
  const cookieSecret = getSessionCookieSecret();
  await setSignedCookie(c, "session", session.id, cookieSecret, {
    secure: true,
    httpOnly: true,
    expires: new Date(session.expiresAt),
    sameSite: "strict",
  });
  return c.redirect("/chat");
}
