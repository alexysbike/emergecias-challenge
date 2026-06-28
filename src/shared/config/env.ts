import { resolve } from "path";

export interface Env {
  port: number;
  databasePath: string;
  nodeEnv: string;
  isProduction: boolean;
  logLevel: string;
}

function resolveLogLevel(nodeEnv: string): string {
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL;
  }
  if (nodeEnv === "test") {
    return "silent";
  }
  if (nodeEnv === "production") {
    return "info";
  }
  return "debug";
}

export function loadEnv(): Env {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  return {
    port: Number(process.env.PORT ?? 3000),
    databasePath: resolve(process.env.DATABASE_PATH ?? "./data/app.db"),
    nodeEnv,
    isProduction: nodeEnv === "production",
    logLevel: resolveLogLevel(nodeEnv),
  };
}
