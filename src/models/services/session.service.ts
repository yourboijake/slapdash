import { eq } from "drizzle-orm";
import { db } from "..";
import { session } from "../schema";

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
      .where(eq(session.userId, userId));
    return sessionData;
  } catch (error) {
    console.error(error);
    return [];
  }
}
