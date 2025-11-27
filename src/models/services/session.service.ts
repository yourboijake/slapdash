import type { Context } from "hono";
import { eq, sql, and } from "drizzle-orm";
import { db } from "..";
import { session } from "../schema";
import { getSignedCookie } from "hono/cookie";
import * as dotenv from "dotenv";

export function getSessionCookieSecret() {
  dotenv.config();
  if (!process.env.COOKIE_SECRET) {
    console.warn(
      "No env variable set for COOKIE_SECRET. Set one to avoid using hard-coded default (VERY INSECURE)",
    );
  }
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

type sessionDeletionResult = {
  success: boolean;
  sessionId?: string;
  error?: string;
};

export async function deleteSession(
  sessionId: string,
): Promise<sessionDeletionResult> {
  try {
    const deleteSessionResult = await db
      .delete(session)
      .where(eq(session.id, sessionId))
      .returning({ sessionId: session.id });
    if (deleteSessionResult.length === 0) {
      throw new Error(`failed to delete session ${sessionId}`);
    }
    return {
      success: true,
      sessionId: deleteSessionResult[0].sessionId,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: `failed to delete session ${sessionId}`,
    };
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
      .where(and(eq(session.userId, userId)));
    return sessionData;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function retrieveOrCreateSession(
  userId: number,
): Promise<typeof session.$inferSelect | null> {
  try {
    const existingSessions = await getSessionsByUserId(userId);
    if (existingSessions.length === 0) {
      const newSession = await createSession(userId);
      return newSession;
    }
    const expiresAt = new Date(existingSessions[0].expiresAt);
    if (expiresAt < new Date()) {
      const deleteSessionResult = await deleteSession(existingSessions[0].id);
      if (!deleteSessionResult.success) {
        throw new Error(
          "Found existing session with expired date, and attempt to delete it failed",
        );
      }
      const newSession = await createSession(userId);
      return newSession;
    }
    return existingSessions[0];
  } catch (error) {
    console.error(error);
    return null;
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
