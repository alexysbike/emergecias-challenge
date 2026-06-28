import type { ActivityType } from "../entities/contact";
import type { ActivityWithContact, ContactActivity } from "../entities/activity";

export interface CreateActivityInput {
  personId: number;
  activityType: ActivityType;
  activityDate: string;
  description?: string;
}

export interface ActivityListFilters {
  personId: number;
  activityType?: ActivityType;
}

export interface ActivityRepository {
  create(input: CreateActivityInput): Promise<ContactActivity>;
  list(filters: ActivityListFilters): Promise<ActivityWithContact[]>;
  contactExists(personId: number): Promise<boolean>;
}
