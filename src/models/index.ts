import "dotenv/config";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";
import { removeExpiredSessions } from "./services/session.service";

export const db = drizzle(process.env.DB_FILE_NAME!, { schema });

//setInterval(removeExpiredSessions, 60 * 1000); //remove expired sessions every minute
