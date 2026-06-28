import { loadEnv } from "../../../shared/config/env";
import { createLogger } from "../../../infrastructure/logging/pino-logger";
import { createDbClient } from "../client";
import { runMigrations } from "../migrate";
import { seedPhoneTypes } from "./run-seed";

async function main(): Promise<void> {
  const env = loadEnv();
  const { logger } = createLogger(env);
  await runMigrations(env.databasePath);
  const db = createDbClient(env.databasePath);
  await seedPhoneTypes(db);
  logger.info("Seed completed");
}

main().catch((err) => {
  const { logger } = createLogger(loadEnv());
  logger.error("Seed failed", { err });
});
