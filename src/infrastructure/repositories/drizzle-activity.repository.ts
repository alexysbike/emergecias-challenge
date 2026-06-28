import { and, eq } from "drizzle-orm";
import type { ContactActivity } from "../../domain/entities/activity";
import type {
  ActivityListFilters,
  ActivityRepository,
  CreateActivityInput,
} from "../../domain/repositories/activity.repository";
import type { ActivityWithContact } from "../../domain/entities/activity";
import type { DbClient } from "../database/client";
import { contactActivities, persons } from "../database/schema";
import { DrizzleContactRepository } from "./drizzle-contact.repository";

export class DrizzleActivityRepository implements ActivityRepository {
  private readonly contactRepo: DrizzleContactRepository;

  constructor(private readonly db: DbClient) {
    this.contactRepo = new DrizzleContactRepository(db);
  }

  async contactExists(personId: number): Promise<boolean> {
    const rows = await this.db
      .select({ id: persons.id })
      .from(persons)
      .where(eq(persons.id, personId))
      .limit(1);
    return rows.length > 0;
  }

  async create(input: CreateActivityInput): Promise<ContactActivity> {
    const [row] = await this.db
      .insert(contactActivities)
      .values({
        personId: input.personId,
        activityType: input.activityType,
        activityDate: input.activityDate,
        description: input.description,
      })
      .returning();

    return {
      id: row.id,
      personId: row.personId,
      activityType: row.activityType as ContactActivity["activityType"],
      activityDate: row.activityDate,
      description: row.description ?? undefined,
    };
  }

  async list(filters: ActivityListFilters): Promise<ActivityWithContact[]> {
    const conditions = [eq(contactActivities.personId, filters.personId)];
    if (filters.activityType) {
      conditions.push(eq(contactActivities.activityType, filters.activityType));
    }

    const rows = await this.db
      .select()
      .from(contactActivities)
      .where(and(...conditions));

    const contact = await this.contactRepo.findById(filters.personId);
    if (!contact) {
      return [];
    }

    return rows.map((row) => ({
      id: row.id,
      personId: row.personId,
      activityType: row.activityType as ContactActivity["activityType"],
      activityDate: row.activityDate,
      description: row.description ?? undefined,
      contact,
    }));
  }
}
