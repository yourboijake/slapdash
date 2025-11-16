import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { getSignedCookie, setSignedCookie } from "hono/cookie";
import { createUser, validateSignIn } from "../../models/services/user.service";
import * as dotenv from "dotenv";
import {
  createSession,
  getSessionsByUserId,
} from "../../models/services/session.service";

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
    throw new HTTPException(signInValidation?.error?.status || 404, {
      message: signInValidation?.error?.message || "Unable to find user",
    });
  }
  const existingSessions = await getSessionsByUserId(signInValidation.user.id);
  if (existingSessions.length === 0) {
    const newSession = await createSession(signInValidation.user.id);
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
  }
  return c.redirect("/chat");
}
