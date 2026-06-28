import { mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { loadEnv } from "../../shared/config/env";
import { createLogger } from "../../infrastructure/logging/pino-logger";
import { closeDbClient, createDbClient } from "./client";

const MIGRATIONS_FOLDER = resolve(__dirname, "migrations");

export async function runMigrations(databasePath: string): Promise<void> {
  if (!databasePath.includes(":memory:") && !databasePath.startsWith("file:")) {
    mkdirSync(dirname(databasePath), { recursive: true });
  }
  const db = createDbClient(databasePath);
  try {
    migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  } finally {
    closeDbClient(db);
  }
}

if (require.main === module) {
  const env = loadEnv();
  const { logger } = createLogger(env);
  runMigrations(env.databasePath)
    .then(() => logger.info("Migrations completed"))
    .catch((err) => logger.error("Migrations failed", { err }));
}
