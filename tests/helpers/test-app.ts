import type { Express } from "express";
import { buildExpressApp } from "../../src/infrastructure/http/express/express-http-server";
import { createLogger } from "../../src/infrastructure/logging/pino-logger";
import { createApp } from "../../src/composition/create-app";

export async function createTestApp(dbPath: string): Promise<Express> {
  const { env, routers } = await createApp({ databasePath: dbPath });
  const { logger, pino } = createLogger(env);
  return buildExpressApp({ port: env.port, routers, env, logger, pinoLogger: pino });
}
