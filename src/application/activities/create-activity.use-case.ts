import type { ContactActivity } from "../../domain/entities/activity";
import type {
  ActivityRepository,
  CreateActivityInput,
} from "../../domain/repositories/activity.repository";
import { NotFoundError } from "../../shared/errors/not-found.error";

export class CreateActivityUseCase {
  constructor(private readonly activityRepository: ActivityRepository) {}

  async execute(input: CreateActivityInput): Promise<ContactActivity> {
    const exists = await this.activityRepository.contactExists(input.personId);
    if (!exists) {
      throw new NotFoundError("Contact not found");
    }

    return this.activityRepository.create(input);
  }
}
