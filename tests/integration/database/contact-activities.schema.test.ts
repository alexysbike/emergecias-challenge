import { eq } from "drizzle-orm";
import { createDbClient, closeDbClient } from "../../../src/infrastructure/database/client";
import { contactActivities, persons } from "../../../src/infrastructure/database/schema";
import { setupTestDb } from "../../helpers/test-db";

describe("contact_activities activity_type CHECK constraint", () => {
  let dbPath: string;
  let cleanup: () => void;

  beforeAll(async () => {
    const testDb = await setupTestDb();
    dbPath = testDb.dbPath;
    cleanup = testDb.cleanup;
  });

  afterAll(() => {
    cleanup();
  });

  async function createPerson(email: string) {
    const db = createDbClient(dbPath);
    const [person] = await db
      .insert(persons)
      .values({
        firstName: "Test",
        lastName: "Person",
        dateOfBirth: "1990-01-01",
        email,
      })
      .returning();
    closeDbClient(db);
    return person;
  }

  it("accepts call, meeting, and email", async () => {
    const person = await createPerson("valid-types@example.com");
    const db = createDbClient(dbPath);

    for (const activityType of ["call", "meeting", "email"] as const) {
      const [row] = await db
        .insert(contactActivities)
        .values({
          personId: person.id,
          activityType,
          activityDate: "2026-06-26T10:30:00.000Z",
        })
        .returning();

      expect(row.activityType).toBe(activityType);
    }

    closeDbClient(db);
  });

  it("rejects invalid activity_type", async () => {
    const person = await createPerson("invalid-type@example.com");
    const db = createDbClient(dbPath);

    await expect(
      db.insert(contactActivities).values({
        personId: person.id,
        activityType: "sms",
        activityDate: "2026-06-26T10:30:00.000Z",
      }),
    ).rejects.toThrow(/CHECK constraint failed/);

    expect(() =>
      db.$client
        .prepare(
          "INSERT INTO contact_activities (person_id, activity_type, activity_date) VALUES (?, ?, ?)",
        )
        .run(person.id, "invalid", "2026-06-26T10:30:00.000Z"),
    ).toThrow(/CHECK constraint failed/);

    const rows = await db
      .select()
      .from(contactActivities)
      .where(eq(contactActivities.personId, person.id));
    expect(rows).toHaveLength(0);

    closeDbClient(db);
  });
});
