import "dotenv/config";
import { drizzle } from "drizzle-orm/bun-sqlite";
import Database from "bun:sqlite";

import * as schema from "./schema";

const sqlite = new Database(process.env.DB_FILE_NAME!);
sqlite.run("PRAGMA foreign_keys = ON");
export const db = drizzle(sqlite, { schema });
