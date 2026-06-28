import { mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import Database from "better-sqlite3";
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

export function assertActivityTypeCheckConstraint(dbPath: string): void {
  const sqlite = new Database(dbPath, { readonly: true });
  try {
    const migrationCount = (
      sqlite.prepare("SELECT COUNT(*) as count FROM __drizzle_migrations").get() as {
        count: number;
      }
    ).count;
    const tableSql = (
      sqlite.prepare("SELECT sql FROM sqlite_master WHERE name = 'contact_activities'").get() as
        { sql: string | null } | undefined
    )?.sql;

    if (migrationCount < 2) {
      throw new Error(
        `Expected at least 2 migrations, found ${migrationCount}. Run "npm run db:generate" if the contact_activities CHECK migration is missing.`
      );
    }

    if (!tableSql?.includes("CHECK")) {
      throw new Error(
        'contact_activities is missing the activity_type CHECK constraint. Ensure migration "0001_clammy_hex" is present and applied.'
      );
    }
  } finally {
    sqlite.close();
  }
}
