import { db } from "..";
import { user } from "../schema";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { eq } from "drizzle-orm";

const NewUserSchema = z
  .object({
    name: z.string(),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password cannot be more than 72 characters"),
    "confirm-password": z.string(),
  })
  .refine((data) => data.password === data["confirm-password"], {
    error: "Passwords must match",
  });

const SignInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string(),
});

function hashPassword(password: string) {
  try {
    const hashedPassword = Bun.password.hash(password);
    return hashedPassword;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function validatePassword(password: string, storedPasswordHash: string) {
  try {
    const valid = Bun.password.verify(password, storedPasswordHash);
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

type SignInResult = {
  user: typeof user.$inferSelect | null;
  error?: HTTPException;
};

export async function createUser(
  formData: FormData,
): Promise<CreateUserResult> {
  const formDataObject = Object.fromEntries(formData.entries());
  const newUser = NewUserSchema.safeParse(formDataObject);
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

async function getUserByEmail(userEmail: string) {
  const userData = await db.query.user.findFirst({
    where: eq(user?.email, userEmail),
  });
  return userData;
}

export async function getUserById(userId: number) {
  const userData = await db.query.user.findFirst({
    where: eq(user?.id, userId),
  });
  return userData;
}

export async function validateSignIn(
  formData: FormData,
): Promise<SignInResult> {
  const formDataObject = Object.fromEntries(formData.entries());
  const loginCredentials = SignInSchema.safeParse(formDataObject);
  if (!loginCredentials.success) {
    return {
      user: null,
      error: new HTTPException(401, { message: "Invalid sign in data" }),
    };
  }
  const userData = await getUserByEmail(loginCredentials.data.email);
  if (!userData) {
    return {
      user: null,
      error: new HTTPException(404, {
        message: "No user found with that email",
      }),
    };
  }
  const isValidPassword = await validatePassword(
    loginCredentials.data.password,
    userData.password,
  );
  if (!isValidPassword) {
    return {
      user: null,
      error: new HTTPException(401, { message: "Invalid password" }),
    };
  }
  return {
    user: userData,
  };
}

export async function getAllUsers(): Promise<(typeof user.$inferSelect)[]> {
  const users = await db.query.user.findMany();
  return users;
}
