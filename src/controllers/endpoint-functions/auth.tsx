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
import { AuthToast } from "../../views/components/auth/auth-toast";

export async function signUpPost(c: Context) {
  const formData = await c.req.formData();
  const createUserResult = await createUser(formData);
  if (createUserResult.error) {
    c.status(createUserResult.error.status);
    c.header("HX-Retarget", "#toast-container");
    c.header("HX-Swap", "outerHTML");
    return c.render(
      <AuthToast message={createUserResult.error.message} type="failure" />,
    );
  } else if (!createUserResult.newUser) {
    c.status(500);
    c.header("HX-Retarget", "#toast-container");
    c.header("HX-Swap", "outerHTML");
    return c.render(
      <AuthToast message={"Failed to create new user"} type="failure" />,
    );
  }
  const newSession = await createSession(createUserResult.newUser.id);
  if (!newSession) {
    c.status(500);
    c.header("HX-Retarget", "#toast-container");
    c.header("HX-Swap", "outerHTML");
    return c.render(
      <AuthToast
        message={"Failed to create browser session for new user"}
        type="failure"
      />,
    );
  }
  dotenv.config();
  const cookieSecret = process.env.COOKIE_SECRET || "set-cookie-secret!";
  await setSignedCookie(c, "session", newSession.id, cookieSecret, {
    secure: true,
    httpOnly: true,
    expires: new Date(newSession.expiresAt),
    sameSite: "strict",
  });
  c.status(200);
  c.header("HX-Retarget", "#toast-container");
  c.header("HX-Swap", "outerHTML");
  return c.render(
    <AuthToast
      message={
        "Successfully created new user. Click the link below to sign in."
      }
      type="success"
    />,
  );
}

export async function signInPost(c: Context) {
  const formData = await c.req.formData();
  const signInValidation = await validateSignIn(formData);
  if (signInValidation.error || !signInValidation.user) {
    const errorMessage = "Invalid email or password";
    c.status(401);
    c.header("HX-Retarget", "#toast-container");
    c.header("HX-Swap", "outerHTML");
    return c.render(<AuthToast message={errorMessage} type="failure" />);
  }
  const session = await retrieveOrCreateSession(signInValidation.user.id);
  if (!session) {
    const errorMessage =
      "Unable to authenticate user due to internal server error";
    c.status(500);
    c.header("HX-Retarget", "#toast-container");
    c.header("HX-Swap", "outerHTML");
    return c.render(<AuthToast message={errorMessage} type="failure" />);
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
  return c.body(null);
}
