import { mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { createDbClient, closeDbClient } from "../../src/infrastructure/database/client";
import { runMigrations } from "../../src/infrastructure/database/migrate";
import { seedPhoneTypes } from "../../src/infrastructure/database/seed/run-seed";

export async function setupTestDb(): Promise<{ dbPath: string; cleanup: () => void }> {
  const dir = mkdtempSync(join(tmpdir(), "emergencias-test-"));
  const dbPath = join(dir, "test.db");
  await runMigrations(dbPath);
  const db = createDbClient(dbPath);
  await seedPhoneTypes(db);
  closeDbClient(db);

  return {
    dbPath,
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}
