import type { ActivityWithContact } from "../../domain/entities/activity";
import type {
  ActivityListFilters,
  ActivityRepository,
} from "../../domain/repositories/activity.repository";
import { NotFoundError } from "../../shared/errors/not-found.error";

export class ListActivitiesUseCase {
  constructor(private readonly activityRepository: ActivityRepository) {}

  async execute(filters: ActivityListFilters): Promise<ActivityWithContact[]> {
    const exists = await this.activityRepository.contactExists(filters.personId);
    if (!exists) {
      throw new NotFoundError("Contact not found");
    }

    return this.activityRepository.list(filters);
  }
}
