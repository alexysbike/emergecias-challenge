import { sql } from "drizzle-orm";
import type { DbClient } from "../client";
import { phoneTypes } from "../schema";
import { PHONE_TYPE_SEED } from "./phone-types.seed";

export async function seedPhoneTypes(db: DbClient): Promise<void> {
  for (const row of PHONE_TYPE_SEED) {
    await db.insert(phoneTypes).values(row).onConflictDoNothing({ target: phoneTypes.id });
  }
}

export async function ensurePhoneTypesSeeded(db: DbClient): Promise<void> {
  const result = await db.select({ count: sql<number>`count(*)` }).from(phoneTypes);
  if ((result[0]?.count ?? 0) === 0) {
    await seedPhoneTypes(db);
  }
}
