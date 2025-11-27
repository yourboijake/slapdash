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
    c.status(401);
    c.header("HX-Retarget", "#toast-container");
    c.header("HX-Swap", "outerHTML");
    return c.render(<AuthFailureToast errorMessage={errorMessage} />);
  }
  const session = await retrieveOrCreateSession(signInValidation.user.id);
  if (!session) {
    const errorMessage =
      "Unable to authenticate user due to internal server error";
    c.status(500);
    c.header("HX-Retarget", "#toast-container");
    c.header("HX-Swap", "outerHTML");
    return c.render(<AuthFailureToast errorMessage={errorMessage} />);
  }
  const cookieSecret = getSessionCookieSecret();
  await setSignedCookie(c, "session", session.id, cookieSecret, {
    secure: true,
    httpOnly: true,
    expires: new Date(session.expiresAt),
    sameSite: "strict",
  });
  c.status(200);
  c.header("HX-Redirect", "/chat");
  //return c.redirect("/chat");
  return c.body(null);
}
