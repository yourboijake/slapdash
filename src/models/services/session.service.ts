import type { Context } from "hono";
import { eq, sql, and } from "drizzle-orm";
import { db } from "..";
import { session } from "../schema";
import { getSignedCookie } from "hono/cookie";
import * as dotenv from "dotenv";

export function getSessionCookieSecret() {
  dotenv.config();
  const cookieSecret = process.env.COOKIE_SECRET || "set-cookie-secret!";
  return cookieSecret;
}

export async function createSession(userId: number) {
  try {
    const createSessionResult = await db
      .insert(session)
      .values({
        userId,
      })
      .returning();
    if (createSessionResult.length === 0) {
      return null;
    }
    return createSessionResult[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function validateSession(c: Context): Promise<boolean> {
  const cookieSecret = getSessionCookieSecret();
  const sessionCookie = await getSignedCookie(c, cookieSecret);
  if (!sessionCookie.session) {
    return false;
  }
  const sessionData = await getSessionById(sessionCookie.session);
  if (!sessionData) {
    return false;
  }
  return true;
}

export async function getSessionById(sessionId: string) {
  try {
    const sessionData = await db.query.session.findFirst({
      where: eq(session?.id, sessionId),
    });
    if (!sessionData) {
      return null;
    }
    return sessionData;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getSessionsByUserId(userId: number) {
  try {
    const sessionData = await db
      .select()
      .from(session)
      .where(
        and(eq(session.userId, userId), sql`(expires_at < CURRENT_TIMESTAMP)`),
      );
    return sessionData;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function removeExpiredSessions(): Promise<boolean> {
  try {
    await db.delete(session).where(sql`(expires_at < CURRENT_TIMESTAMP)`);
    console.log("removed expired sessions");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
