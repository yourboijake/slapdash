import { db } from "..";
import { user } from "../schema";
import { z } from "zod";
import * as bcrypt from "bcrypt";
import type { FormData } from "../../controllers/auth";
import { HTTPException } from "hono/http-exception";

const NewUserSchema = z.object({
  name: z.string(),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot be more than 72 characters"),
});

async function hashPassword(password: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function validatePassword(password: string, storedPasswordHash: string) {
  try {
    const valid = await bcrypt.compare(password, storedPasswordHash);
    return valid;
  } catch (error) {
    console.error(error);
    return false;
  }
}

type CreateUserResult = {
  newUser: typeof user.$inferSelect | null;
  error?: HTTPException;
};

export async function createUser(
  formData: FormData,
): Promise<CreateUserResult> {
  const newUser = NewUserSchema.safeParse(formData);
  if (!newUser.success) {
    return {
      newUser: null,
      error: new HTTPException(400, {
        message: newUser.error.message,
      }),
    };
  }
  const newPassword = await hashPassword(newUser.data.password);
  if (!newPassword) {
    return {
      newUser: null,
      error: new HTTPException(400, {
        message: "Invalid password",
      }),
    };
  }
  newUser.data.password = newPassword;
  const newUserRecord = await db.insert(user).values(newUser.data).returning();
  if (newUserRecord.length === 0) {
    return {
      newUser: null,
      error: new HTTPException(500, {
        message: "Internal server error adding user",
      }),
    };
  }
  return { newUser: newUserRecord[0] };
}
